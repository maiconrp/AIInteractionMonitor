#!/bin/bash

# Update package list
sudo apt update

# Upgrade existing packages
sudo apt upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Check if Node.js and npm are installed
if ! command -v node &> /dev/null
then
    echo "Node.js could not be found"
    exit
fi
if ! command -v npm &> /dev/null
then
    echo "npm could not be found"
    exit
fi
echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"


# Install Git
sudo apt-get install -y git

# Check if Git is installed
if ! command -v git &> /dev/null
then
    echo "Git could not be found"
    exit
fi
echo "Git version: $(git --version)"


# Install PM2 globally
sudo npm install -g pm2

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null
then
    echo "PM2 could not be found"
    exit
fi
echo "PM2 version: $(pm2 -v)"

# Set permissions for /var/www (or your desired app directory)
sudo mkdir -p /var/www/your-app
sudo chown -R $USER:$USER /var/www/your-app

echo "Node.js, npm, Git, and PM2 installed successfully."