#!/bin/bash
# LibraSphere Automated AWS EC2 Deployment Script

echo "=================================================="
echo "🚀 Starting LibraSphere AWS Deployment..."
echo "=================================================="

# 1. System Updates & Node.js/Nginx/MySQL/PM2 Installation
sudo apt-get update -y
sudo apt-get install -y curl git nginx mysql-server

# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# 2. Project Directory Setup
sudo mkdir -p /var/www/librasphere
sudo chown -R $USER:$USER /var/www/librasphere

# Copy current project files to web directory
cp -r . /var/www/librasphere/

cd /var/www/librasphere

# 3. Backend Setup
echo "📦 Installing Backend Dependencies..."
cd backend
npm install
cd ..

# 4. Frontend Setup & Vue 3 Production Build
echo "🏗️ Building Vue 3 Frontend..."
cd frontend
npm install
npm run build
cd ..

# 5. Start Backend Server with PM2
echo "⚙️ Starting PM2 Process Manager..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 6. Configure Nginx Web Server
echo "🌐 Configuring Nginx Reverse Proxy..."
sudo cp nginx.conf /etc/nginx/sites-available/librasphere
sudo ln -sf /etc/nginx/sites-available/librasphere /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo "=================================================="
echo "✅ LibraSphere is live on your AWS EC2 Public IP!"
echo "=================================================="
