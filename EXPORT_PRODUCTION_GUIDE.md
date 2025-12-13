# Export Production Data from MongoDB Atlas

Your production data is in **MongoDB Atlas**, not on this server. Here are your options to export it:

---

## Option 1: Export via MongoDB Atlas Web Interface (Easiest)

### Step 1: Login to MongoDB Atlas
1. Go to https://cloud.mongodb.com
2. Login with your credentials
3. Select your cluster: `customer-apps-pri`

### Step 2: Export Database
1. Click on your cluster
2. Go to **Collections** tab
3. Select database: `devotion_scheduler`
4. Click **Export Collection** button
5. Choose format: **JSON** or **BSON**
6. Download the export

### Step 3: Get the Codebase
```bash
# Download from this server
scp -r user@emergent-server:/app/backend ~/devotion_backup/
scp -r user@emergent-server:/app/frontend ~/devotion_backup/
```

---

## Option 2: Use MongoDB Atlas CLI Tools (From Your Computer)

If you have MongoDB tools installed on your local computer:

```bash
# Install MongoDB Database Tools if not installed
# macOS: brew install mongodb-database-tools
# Ubuntu: sudo apt-get install mongodb-database-tools
# Windows: Download from mongodb.com

# Export the database
mongodump --uri="mongodb+srv://whatsapp-devotion:d4cuf6clqs2c739sehbg@customer-apps-pri.dzqovj.mongodb.net/?appName=whatsapp-devotion" \
  --db=devotion_scheduler \
  --out=./production_backup

# This creates a folder: production_backup/devotion_scheduler/
```

---

## Option 3: Whitelist Server IP & Run Export Script

### Step 1: Whitelist Emergent Server IP in MongoDB Atlas

1. Go to MongoDB Atlas: https://cloud.mongodb.com
2. Select your cluster
3. Go to **Network Access** (left sidebar)
4. Click **Add IP Address**
5. Add: `0.0.0.0/0` (Allow from anywhere) OR the specific server IP
6. Click **Confirm**
7. Wait 1-2 minutes for it to take effect

### Step 2: Run Export Script on Server

```bash
chmod +x /app/export_production_data.sh
/app/export_production_data.sh
```

This will export everything and create an archive at `/tmp/`

---

## What You Need to Migrate

### 1. MongoDB Data
**From:** MongoDB Atlas `devotion_scheduler` database
**Contains:**
- 2 upcoming schedules
- Several sent messages (history)
- All schedule details with images (base64)

### 2. Application Code
**From:** `/app/backend` and `/app/frontend`
**Already exported in:** Previous tar.gz file

### 3. Environment Configuration
**Production .env:**
```
MONGO_URL=mongodb+srv://whatsapp-devotion:...
DB_NAME=devotion_scheduler
GATEWAY_BASE_URL=http://dermapack.net:3001
```

---

## Recommended Approach

**For simplest migration:**

1. **Keep using MongoDB Atlas** (no migration needed!)
   - Just update your new server's `.env` to point to same Atlas cluster
   - Update Network Access to allow your new server IP
   - No data migration required!

2. **OR Export and use local MongoDB:**
   - Export from Atlas (Option 1 or 2)
   - Install MongoDB on new server
   - Import the data
   - Update `.env` to use local MongoDB

---

## Quick Migration (Keep Atlas)

If you want to keep using MongoDB Atlas on your new server:

### On Your New Server:

1. **Install application:**
```bash
# Use the import_data.sh script with previous export
cd /tmp
tar -xzf devotion_scheduler_export_*.tar.gz
cd devotion_export_*
sudo ./import_data.sh $(pwd)
```

2. **Update backend .env:**
```bash
sudo nano /opt/devotion_scheduler/backend/.env
```

Change `MONGO_URL` to:
```
MONGO_URL=mongodb+srv://whatsapp-devotion:d4cuf6clqs2c739sehbg@customer-apps-pri.dzqovj.mongodb.net/?appName=whatsapp-devotion&maxPoolSize=5&retryWrites=true&w=majority
```

3. **Whitelist new server IP in MongoDB Atlas:**
   - Get server IP: `curl ifconfig.me`
   - Add to Atlas Network Access

4. **Start services:**
```bash
sudo systemctl start devotion-backend devotion-frontend
```

**Done!** Your new server will use the same MongoDB Atlas database with all existing data.

---

## Verify Production Data

To check your production data from your computer:

```bash
# Install MongoDB Shell
# https://www.mongodb.com/try/download/shell

# Connect to your Atlas cluster
mongosh "mongodb+srv://whatsapp-devotion:d4cuf6clqs2c739sehbg@customer-apps-pri.dzqovj.mongodb.net/"

# Check data
use devotion_scheduler
db.schedules.countDocuments()
db.schedules.find({status: "scheduled"})  // Upcoming
db.schedules.find({status: "sent"})        // History
```

---

## Summary

**Easiest Option:** Keep using MongoDB Atlas
- No data export needed
- Just point new server to same Atlas cluster
- Update Network Access whitelist
- Done!

**Alternative:** Export and migrate to local MongoDB
- Export via Atlas web interface or CLI
- Import to new server's local MongoDB
- More control, but more setup

Choose based on your preference!
