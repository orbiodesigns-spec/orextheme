#!/bin/bash

# VPS Deployment Script for Stream Theme Master
# Usage: ./deploy.sh

echo "🚀 Starting Deployment..."

# 1. Pull latest changes
echo "📥 Pulling latest changes from git..."
git pull origin main

# 2. Install Dependencies
echo "📦 Installing Server Dependencies..."
cd server
npm install --production
cd ..

echo "📦 Installing Client Dependencies..."
cd client
npm install
cd ..

# 3. Build Frontend
echo "🏗️ Building Frontend..."
cd client
npm run build
cd ..

# 4. Restart Backend (PM2)
echo "🔄 Restarting Backend Server..."
cd server
# Check if PM2 is installed
if ! command -v pm2 &> /dev/null
then
    echo "⚠️ PM2 not found. Installing global PM2..."
    npm install -g pm2
fi

# Reload or Start
pm2 reload ecosystem.config.js || pm2 start ecosystem.config.js
cd ..

echo "✅ Deployment Complete!"
echo "🌍 Client should be served from client/dist (configure Nginx to point there)"
echo "🔌 Server running on port 5000"
