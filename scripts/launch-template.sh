#! /bin/bash
# Update packages
yum update -y

# Add user
useradd webapp -d /home/webapp

# Configure directory and permissions
mkdir -p /var/www/app/frontend /var/www/app/frontend
chown -R webapp:webapp /var/www
chmod -R 775 /var/www
mkdir -p /var/log/app/frontend /var/log/app/frontend
chown -R webapp:webapp /var/log/app 
chmod -R 764 /var/log/app

# Install Puppeter dependencies
amazon-linux-extras install epel -y
yum install -y chromium

# Install Node
curl -fsSL https://rpm.nodesource.com/setup_16.x | bash - 
yum install -y nodejs
yum install -y gcc-c++ make
# Install PM2
npm -g install pm2

# Configure log rotation
echo "\
/home/webapp/.pm2/pm2.log /home/webapp/.pm2/logs/*.log /var/log/app/frontend/*.log /var/log/app/frontend/*.log {
    su webapp webapp
    rotate 10
    daily
    missingok
    notifempty
    nocompress
    copytruncate
    dateext
}
" > /etc/logrotate.d/app

# Install code-deploy agent
yum install -y ruby wget
cd /tmp
wget https://aws-codedeploy-us-east-2.s3.us-east-2.amazonaws.com/latest/install
chmod +x ./install
./install auto

# The code below is only needed if configuring single instance EC2 without autoscaling group
# Install Nginx
#amazon-linux-extras install nginx1 -y
#systemctl enable nginx
#systemctl start nginx

# Install Certbot
#amazon-linux-extras install epel -y
#yum install -y certbot python2-certbot-nginx

