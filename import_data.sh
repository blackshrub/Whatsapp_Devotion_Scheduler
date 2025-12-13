#!/bin/bash
# WhatsApp Devotion Scheduler - Data Import Script
# Run this on your NEW server after extracting the export archive

set -e

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <path_to_exported_directory>"
    echo "Example: $0 /tmp/devotion_export_20251116_120000"
    exit 1
fi

IMPORT_DIR="$1"

if [ ! -d "$IMPORT_DIR" ]; then
    echo "Error: Directory $IMPORT_DIR does not exist"
    exit 1
fi

echo "Importing data from: $IMPORT_DIR"

# 1. Install dependencies
echo "Installing system dependencies..."
sudo apt-get update
sudo apt-get install -y python3 python3-pip python3-venv nodejs npm mongodb-server

# 2. Install yarn
echo "Installing yarn..."
sudo npm install -g yarn

# 3. Create application directory
APP_DIR="/opt/devotion_scheduler"
echo "Creating application directory: $APP_DIR"
sudo mkdir -p "$APP_DIR"
sudo chown $USER:$USER "$APP_DIR"

# 4. Extract codebase
echo "Extracting codebase..."
cd "$APP_DIR"
tar -xzf "$IMPORT_DIR/codebase.tar.gz"

# 5. Restore MongoDB data
echo "Restoring MongoDB database..."
mongorestore --uri="mongodb://localhost:27017/" "$IMPORT_DIR/mongodb_backup"

# 6. Copy environment files
echo "Copying environment files..."
cp "$IMPORT_DIR/backend.env" "$APP_DIR/backend/.env"
cp "$IMPORT_DIR/frontend.env" "$APP_DIR/frontend/.env"

# 7. Restore uploaded images
if [ -d "$IMPORT_DIR/uploads" ]; then
    echo "Restoring uploaded images..."
    mkdir -p "$APP_DIR/backend/uploads"
    cp -r "$IMPORT_DIR/uploads/"* "$APP_DIR/backend/uploads/"
fi

# 8. Install Python dependencies
echo "Installing Python dependencies..."
cd "$APP_DIR/backend"
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 9. Install Node dependencies
echo "Installing Node dependencies..."
cd "$APP_DIR/frontend"
yarn install

# 10. Build frontend
echo "Building frontend..."
yarn build

echo ""
echo "========================================="
echo "Import Complete!"
echo "========================================="
echo "Application installed at: $APP_DIR"
echo ""
echo "Next steps:"
echo "1. Update environment variables in:"
echo "   - $APP_DIR/backend/.env"
echo "   - $APP_DIR/frontend/.env"
echo ""
echo "2. Start the backend:"
echo "   cd $APP_DIR/backend"
echo "   source venv/bin/activate"
echo "   uvicorn server:app --host 0.0.0.0 --port 8001"
echo ""
echo "3. Serve the frontend (in another terminal):"
echo "   cd $APP_DIR/frontend"
echo "   npx serve -s build -p 3000"
echo ""
echo "Or set up systemd services for production"
echo "========================================="
