# WhatsApp Devotion Scheduler - Migration Guide

## Overview
This guide helps you migrate the WhatsApp Devotion Scheduler from Emergent platform to your own Debian server.

---

## Step 1: Export Data from Current Server

On the current server (Emergent platform), run:

```bash
cd /app
chmod +x export_data.sh
./export_data.sh
```

This creates an archive at `/tmp/devotion_scheduler_export_YYYYMMDD_HHMMSS.tar.gz` containing:
- MongoDB database backup
- Environment files (.env)
- Uploaded images
- Complete codebase
- Deployment information

---

## Step 2: Download the Export

From your local machine:

```bash
# Replace with your actual server details
scp user@emergent-server:/tmp/devotion_scheduler_export_*.tar.gz ~/Downloads/
```

---

## Step 3: Upload to Your New Server

```bash
# Upload to your new Debian server
scp ~/Downloads/devotion_scheduler_export_*.tar.gz user@your-new-server:/tmp/
```

---

## Step 4: Extract on New Server

On your new Debian server:

```bash
cd /tmp
tar -xzf devotion_scheduler_export_*.tar.gz
cd devotion_export_*
```

---

## Step 5: Run Import Script

```bash
chmod +x import_data.sh
sudo ./import_data.sh $(pwd)
```

This will:
- Install required system dependencies
- Create application directory at `/opt/devotion_scheduler`
- Restore MongoDB database
- Install Python and Node dependencies
- Set up environment files

---

## Step 6: Update Environment Variables

### Backend Environment (`/opt/devotion_scheduler/backend/.env`)

```bash
MONGO_URL=mongodb://localhost:27017/
DB_NAME=devotion_scheduler
CORS_ORIGINS=*
GATEWAY_BASE_URL=http://dermapack.net:3001
GATEWAY_USER=
GATEWAY_PASS=
```

### Frontend Environment (`/opt/devotion_scheduler/frontend/.env`)

Update with your server's domain or IP:

```bash
REACT_APP_BACKEND_URL=http://your-server-ip:8001
# Or with domain:
REACT_APP_BACKEND_URL=https://yourdomain.com
```

---

## Step 7: Set Up Systemd Services (Production)

### Backend Service

Create `/etc/systemd/system/devotion-backend.service`:

```ini
[Unit]
Description=Devotion Scheduler Backend
After=network.target mongodb.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/devotion_scheduler/backend
Environment="PATH=/opt/devotion_scheduler/backend/venv/bin"
ExecStart=/opt/devotion_scheduler/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Frontend Service (using serve)

Create `/etc/systemd/system/devotion-frontend.service`:

```ini
[Unit]
Description=Devotion Scheduler Frontend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/devotion_scheduler/frontend
ExecStart=/usr/bin/npx serve -s build -p 3000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Enable and Start Services

```bash
sudo systemctl daemon-reload
sudo systemctl enable devotion-backend devotion-frontend
sudo systemctl start devotion-backend devotion-frontend

# Check status
sudo systemctl status devotion-backend
sudo systemctl status devotion-frontend
```

---

## Step 8: Set Up Nginx (Recommended)

Install Nginx:

```bash
sudo apt-get install nginx
```

Create `/etc/nginx/sites-available/devotion`:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # or use IP: _;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' '*' always;
    }

    # Uploads (if serving from backend)
    location /uploads {
        proxy_pass http://localhost:8001;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/devotion /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 9: Set Up SSL (Optional but Recommended)

Install Certbot:

```bash
sudo apt-get install certbot python3-certbot-nginx
```

Get SSL certificate:

```bash
sudo certbot --nginx -d your-domain.com
```

---

## Step 10: Verify Everything Works

1. **Check services are running:**
   ```bash
   sudo systemctl status devotion-backend devotion-frontend
   ```

2. **Check logs:**
   ```bash
   sudo journalctl -u devotion-backend -f
   sudo journalctl -u devotion-frontend -f
   ```

3. **Test the application:**
   - Open browser: `http://your-server-ip` or `https://your-domain.com`
   - Create a test schedule
   - Verify background worker is running
   - Check MongoDB has data: `mongosh devotion_scheduler`

---

## Troubleshooting

### Backend won't start
```bash
# Check Python environment
cd /opt/devotion_scheduler/backend
source venv/bin/activate
python -c "import fastapi; print('FastAPI OK')"

# Check MongoDB connection
mongosh devotion_scheduler --eval "db.schedules.countDocuments()"
```

### Frontend won't build
```bash
cd /opt/devotion_scheduler/frontend
rm -rf node_modules yarn.lock
yarn install
yarn build
```

### Background worker not sending
```bash
# Check backend logs for scheduler
sudo journalctl -u devotion-backend | grep -i "worker\|schedule"
```

### Permission issues
```bash
sudo chown -R www-data:www-data /opt/devotion_scheduler
```

---

## Backup Strategy

### Daily MongoDB Backup

Create `/opt/devotion_scheduler/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/opt/devotion_scheduler/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"
mongodump --uri="mongodb://localhost:27017/devotion_scheduler" --out="$BACKUP_DIR/backup_$DATE"
# Keep only last 7 days
find "$BACKUP_DIR" -type d -mtime +7 -exec rm -rf {} +
```

Add to crontab:

```bash
# Run daily at 2 AM
0 2 * * * /opt/devotion_scheduler/backup.sh
```

---

## Monitoring

### Check Application Health

```bash
# Backend health
curl http://localhost:8001/api/schedules

# Frontend
curl http://localhost:3000

# MongoDB
mongosh devotion_scheduler --eval "db.stats()"
```

---

## Support

If you encounter issues:
1. Check logs: `sudo journalctl -u devotion-backend -n 100`
2. Verify environment variables are correct
3. Ensure MongoDB is running: `sudo systemctl status mongodb`
4. Check disk space: `df -h`

---

## Summary

✅ Export from current server
✅ Transfer to new server
✅ Import and restore data
✅ Configure environment
✅ Set up systemd services
✅ Configure Nginx reverse proxy
✅ Enable SSL (optional)
✅ Set up backups
✅ Monitor and maintain

Your WhatsApp Devotion Scheduler is now running on your own server!
