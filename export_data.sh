#!/bin/bash
# WhatsApp Devotion Scheduler - Data Export Script
# Run this to export all production data

set -e

EXPORT_DIR="/tmp/devotion_export_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$EXPORT_DIR"

echo "Exporting data to: $EXPORT_DIR"

# 1. Export MongoDB data
echo "Exporting MongoDB database..."
mongodump --uri="mongodb://localhost:27017/devotion_scheduler" --out="$EXPORT_DIR/mongodb_backup"

# 2. Copy environment files
echo "Copying environment files..."
cp /app/backend/.env "$EXPORT_DIR/backend.env"
cp /app/frontend/.env "$EXPORT_DIR/frontend.env"

# 3. Copy uploaded images (if any exist in old system)
echo "Copying uploaded images..."
if [ -d "/app/backend/uploads" ]; then
    cp -r /app/backend/uploads "$EXPORT_DIR/uploads"
fi

# 4. Export current codebase
echo "Creating code archive..."
cd /app
tar -czf "$EXPORT_DIR/codebase.tar.gz" \
    --exclude='node_modules' \
    --exclude='__pycache__' \
    --exclude='.git' \
    --exclude='*.pyc' \
    --exclude='.env' \
    backend/ frontend/ README.md

# 5. Create deployment info
echo "Creating deployment info..."
cat > "$EXPORT_DIR/deployment_info.txt" << EOF
WhatsApp Devotion Scheduler - Deployment Information
Exported: $(date)

MongoDB Database: devotion_scheduler
Backend Port: 8001
Frontend Port: 3000

Required Environment Variables:
- MONGO_URL (MongoDB connection string)
- DB_NAME (devotion_scheduler)
- GATEWAY_BASE_URL (http://dermapack.net:3001)
- GATEWAY_USER (optional)
- GATEWAY_PASS (optional)
- CORS_ORIGINS (*)
- REACT_APP_BACKEND_URL (your backend URL)

Python Dependencies: see backend/requirements.txt
Node Dependencies: see frontend/package.json
EOF

# 6. Create archive of everything
echo "Creating final archive..."
cd /tmp
tar -czf "devotion_scheduler_export_$(date +%Y%m%d_%H%M%S).tar.gz" "$(basename $EXPORT_DIR)"

echo ""
echo "========================================="
echo "Export Complete!"
echo "========================================="
echo "Archive location: /tmp/devotion_scheduler_export_*.tar.gz"
echo ""
echo "To download, use one of these methods:"
echo "1. SCP: scp user@this-server:/tmp/devotion_scheduler_export_*.tar.gz ."
echo "2. SFTP or download via file manager"
echo ""
echo "On your new server, extract with:"
echo "  tar -xzf devotion_scheduler_export_*.tar.gz"
echo "========================================="
