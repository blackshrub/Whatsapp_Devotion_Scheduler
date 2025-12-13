#!/bin/bash
# Export Production Data from MongoDB Atlas
# Run this script to export your ACTUAL production data

set -e

PROD_MONGO="mongodb+srv://whatsapp-devotion:d4cuf6clqs2c739sehbg@customer-apps-pri.dzqovj.mongodb.net/?appName=whatsapp-devotion&maxPoolSize=5&retryWrites=true&w=majority"
EXPORT_DIR="/tmp/production_export_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$EXPORT_DIR"

echo "==========================================="
echo "Exporting PRODUCTION data from MongoDB Atlas"
echo "==========================================="
echo "Export directory: $EXPORT_DIR"
echo ""

# 1. Export MongoDB Atlas data
echo "Step 1: Exporting MongoDB database from Atlas..."
mongodump --uri="$PROD_MONGO" --db=devotion_scheduler --out="$EXPORT_DIR/mongodb_backup"

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to connect to MongoDB Atlas"
    echo "Please ensure:"
    echo "1. Your IP is whitelisted in MongoDB Atlas Network Access"
    echo "2. Or use 'Allow Access from Anywhere' (0.0.0.0/0)"
    echo ""
    echo "To whitelist IP in MongoDB Atlas:"
    echo "1. Go to https://cloud.mongodb.com"
    echo "2. Select your cluster"
    echo "3. Network Access → Add IP Address"
    echo "4. Add current IP or 0.0.0.0/0"
    exit 1
fi

# 2. Create production .env file
echo ""
echo "Step 2: Creating production environment file..."
cat > "$EXPORT_DIR/production.env" << 'EOF'
# Production Environment Variables
MONGO_URL=mongodb+srv://whatsapp-devotion:d4cuf6clqs2c739sehbg@customer-apps-pri.dzqovj.mongodb.net/?appName=whatsapp-devotion&maxPoolSize=5&retryWrites=true&w=majority
DB_NAME=devotion_scheduler
CORS_ORIGINS=*
GATEWAY_BASE_URL=http://dermapack.net:3001
GATEWAY_USER=
GATEWAY_PASS=
EOF

# 3. Get current codebase
echo "Step 3: Including current codebase..."
cd /app
tar -czf "$EXPORT_DIR/codebase.tar.gz" \
    --exclude='node_modules' \
    --exclude='__pycache__' \
    --exclude='.git' \
    --exclude='*.pyc' \
    backend/ frontend/ README.md export_data.sh import_data.sh MIGRATION_GUIDE.md 2>/dev/null

# 4. Create deployment info
echo "Step 4: Creating deployment info..."
cat > "$EXPORT_DIR/PRODUCTION_INFO.txt" << EOF
WhatsApp Devotion Scheduler - PRODUCTION Export
Exported: $(date)
Production URL: https://wa.gkbj.org

Database: MongoDB Atlas (devotion_scheduler)
Connection: mongodb+srv cluster

To restore on new server:
1. Update MongoDB connection string in .env
2. Run: mongorestore --uri="YOUR_NEW_MONGO_URL" mongodb_backup/

Environment Variables:
- MONGO_URL: Your MongoDB connection string
- DB_NAME: devotion_scheduler
- GATEWAY_BASE_URL: http://dermapack.net:3001
- REACT_APP_BACKEND_URL: Your backend URL

Note: If migrating to new MongoDB:
- You can use MongoDB Atlas (current)
- Or install MongoDB locally on your server
- Or use any managed MongoDB service
EOF

# 5. Create final archive
echo ""
echo "Step 5: Creating final archive..."
cd /tmp
ARCHIVE_NAME="production_devotion_scheduler_$(date +%Y%m%d_%H%M%S).tar.gz"
tar -czf "$ARCHIVE_NAME" "$(basename $EXPORT_DIR)"

echo ""
echo "==========================================="
echo "✅ PRODUCTION Export Complete!"
echo "==========================================="
echo "Archive: /tmp/$ARCHIVE_NAME"
echo ""
echo "Archive contains:"
echo "  ✓ MongoDB Atlas database backup"
echo "  ✓ Production environment config"
echo "  ✓ Complete application code"
echo "  ✓ Migration scripts & guide"
echo ""
echo "To download:"
echo "  scp user@server:/tmp/$ARCHIVE_NAME ."
echo ""
echo "Size:"
du -h "/tmp/$ARCHIVE_NAME"
echo "==========================================="
