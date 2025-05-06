#!/bin/bash
set -e
# Set the directory for the application
APP_DIR="/var/www/your-app"

# Check if the directory exists, create it if not
if [ ! -d "$APP_DIR" ]; then
  sudo mkdir -p "$APP_DIR"
  echo "Created directory: $APP_DIR"
fi

# Change owner and permissions to the current user
sudo chown -R $USER:$USER "$APP_DIR"
echo "Changed owner and permissions for $APP_DIR"

# Navigate to the application directory
cd "$APP_DIR" || exit

# Check if the project exists, clone if not
if [ ! -d "$APP_DIR/.git" ]; then
  git clone YOUR_REPOSITORY_URL .
  echo "Cloned repository into $APP_DIR"
else
  # If the project exists, perform a git pull
  git pull
  echo "Updated repository in $APP_DIR"
fi

# Copy .env file if exists
cp -n /tmp/.env "$APP_DIR"
echo "Copied .env file"

# Build and run using docker-compose
docker-compose up -d
echo "Builded and runned the project with docker-compose"
echo "Deployment completed!"

echo "Deployment completed!"

echo "Deployment completed!"