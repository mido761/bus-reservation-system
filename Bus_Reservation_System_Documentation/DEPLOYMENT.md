# Deployment Documentation

## Overview
This document provides comprehensive deployment instructions for the Bus Reservation System backend, covering various deployment scenarios from development to production.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Local Development Deployment](#local-development-deployment)
4. [Production Deployment](#production-deployment)
5. [Cloud Deployment Options](#cloud-deployment-options)
6. [Database Deployment](#database-deployment)
7. [Environment Variables](#environment-variables)
8. [SSL/HTTPS Configuration](#sslhttps-configuration)
9. [Monitoring and Logging](#monitoring-and-logging)
10. [Backup Strategies](#backup-strategies)

## Prerequisites

### System Requirements
- **Node.js**: v16.0 or higher
- **npm**: v8.0 or higher
- **MongoDB**: v5.0 or higher
- **Memory**: Minimum 512MB RAM (2GB+ recommended for production)
- **Storage**: Minimum 1GB free space

### Required Services
- MongoDB database (local or cloud)
- Email service (Gmail or SMTP)
- Pusher account (for real-time features)
- SSL certificate (for production)

## Environment Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd bus-reservation-system
npm install
```

### 2. Environment Configuration
Create `.env` file in root directory:
```env
# Database
MONGO_URI=mongodb://localhost:27017/bus_reservation_system

# Session
SESSION_SECRET=your_super_secure_session_secret_key_here

# Pusher (Real-time)
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_pusher_cluster

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password

# Server
PORT=5000
NODE_ENV=production
BACK_END_URL=https://yourdomain.com
```

## Local Development Deployment

### Quick Start
```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Or start production server
npm start
```

### Development Environment Variables
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/bus_reservation_dev
```

### Local MongoDB Setup
```bash
# Install MongoDB Community Edition
# Windows: Download from MongoDB website
# macOS: brew install mongodb-community
# Ubuntu: sudo apt install mongodb

# Start MongoDB service
# Windows: net start MongoDB
# macOS/Linux: sudo systemctl start mongod

# Access MongoDB shell
mongosh
```

## Production Deployment

### 1. Server Preparation
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Create application user
sudo adduser busapp
sudo usermod -aG sudo busapp
```

### 2. Application Deployment
```bash
# Switch to application user
su - busapp

# Clone repository
git clone <repository-url> /home/busapp/bus-reservation
cd /home/busapp/bus-reservation

# Install dependencies
npm ci --only=production

# Build client (if included)
npm run build

# Set file permissions
chmod +x server/index.js
```

### 3. PM2 Configuration
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'bus-reservation-backend',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### 4. Start Production Server
```bash
# Create logs directory
mkdir logs

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

## Cloud Deployment Options

### 1. Heroku Deployment

#### Preparation
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-bus-reservation-app
```

#### Configuration
```bash
# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=your_session_secret
heroku config:set MONGO_URI=your_mongodb_uri
heroku config:set PUSHER_APP_ID=your_pusher_app_id
heroku config:set PUSHER_KEY=your_pusher_key
heroku config:set PUSHER_SECRET=your_pusher_secret
heroku config:set PUSHER_CLUSTER=your_pusher_cluster
heroku config:set EMAIL_USER=your_email
heroku config:set EMAIL_PASS=your_email_password
```

#### Deploy
```bash
# Deploy to Heroku
git push heroku main

# Scale dynos
heroku ps:scale web=1
```

### 2. AWS EC2 Deployment

#### EC2 Instance Setup
```bash
# Connect to EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js and dependencies
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs nginx

# Clone and setup application
git clone <repository-url>
cd bus-reservation-system
npm install
```

#### Nginx Configuration
Create `/etc/nginx/sites-available/bus-reservation`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Enable Nginx Site
```bash
sudo ln -s /etc/nginx/sites-available/bus-reservation /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. DigitalOcean Droplet

#### Droplet Setup
```bash
# Create droplet with Ubuntu 20.04
# Connect via SSH
ssh root@your-droplet-ip

# Setup firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable

# Install dependencies
apt update
apt install nodejs npm nginx mongodb
```

## Database Deployment

### MongoDB Atlas (Cloud)
1. Create MongoDB Atlas account
2. Create cluster
3. Create database user
4. Whitelist IP addresses
5. Get connection string
6. Update MONGO_URI in environment

### Local MongoDB Production
```bash
# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# Secure MongoDB
mongo
> use admin
> db.createUser({
    user: "busadmin",
    pwd: "secure_password",
    roles: ["userAdminAnyDatabase"]
  })

# Enable authentication in /etc/mongod.conf
security:
  authorization: enabled
```

## Environment Variables

### Production Environment Variables
```env
# Required for production
NODE_ENV=production
PORT=5000
SESSION_SECRET=complex_random_string_min_32_chars
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/busdb

# External Services
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_pusher_cluster

# Email Service
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=your_app_password

# URLs
BACK_END_URL=https://api.yourdomain.com
FRONT_END_URL=https://yourdomain.com
```

### Security Considerations
- Use environment-specific secrets
- Rotate secrets regularly
- Use secret management services in cloud
- Never commit secrets to version control

## SSL/HTTPS Configuration

### Let's Encrypt (Free SSL)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Nginx HTTPS Configuration
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoring and Logging

### PM2 Monitoring
```bash
# View logs
pm2 logs

# Monitor processes
pm2 monit

# View status
pm2 status

# Restart application
pm2 restart bus-reservation-backend
```

### Log Management
```bash
# Create log rotation configuration
sudo nano /etc/logrotate.d/bus-reservation

/home/busapp/bus-reservation/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 busapp busapp
    postrotate
        pm2 reloadLogs
    endscript
}
```

### Health Checks
Add health check endpoint in server:
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

## Backup Strategies

### Database Backup
```bash
# MongoDB backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGO_URI" --out="/backups/mongo_$DATE"
tar -czf "/backups/mongo_$DATE.tar.gz" "/backups/mongo_$DATE"
rm -rf "/backups/mongo_$DATE"

# Remove backups older than 30 days
find /backups -name "mongo_*.tar.gz" -mtime +30 -delete
```

### Application Backup
```bash
# Code backup
git archive --format=tar.gz --output="app_backup_$(date +%Y%m%d).tar.gz" HEAD

# Environment backup (excluding secrets)
cp .env.example .env.backup
```

### Automated Backup with Cron
```bash
# Add to crontab
sudo crontab -e

# Daily database backup at 2 AM
0 2 * * * /home/busapp/scripts/backup_db.sh

# Weekly application backup
0 3 * * 0 /home/busapp/scripts/backup_app.sh
```

## Performance Optimization

### PM2 Cluster Mode
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'bus-reservation-backend',
    script: 'server/index.js',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    max_memory_restart: '1G'
  }]
};
```

### Nginx Optimization
```nginx
# Add to nginx.conf
gzip on;
gzip_types text/plain text/css application/json application/javascript;

# Enable caching for static files
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Troubleshooting Deployment

### Common Issues
1. **Port already in use**: Change PORT environment variable
2. **Permission denied**: Check file permissions and user access
3. **MongoDB connection failed**: Verify connection string and network access
4. **SSL certificate issues**: Check domain configuration and DNS

### Debug Commands
```bash
# Check process status
pm2 status
ps aux | grep node

# Check ports
sudo netstat -tlnp | grep :5000

# Check logs
tail -f logs/combined.log
journalctl -u nginx -f

# Test endpoints
curl -I http://localhost:5000/health
```

---
*Last updated: $(Get-Date)*