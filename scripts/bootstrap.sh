#!/bin/bash
# ---------------------------------------------------------
# AWS EC2 Bootstrap Script for Emirates ERP
# Run this script ONCE on your new EC2 instance to set it up
# ---------------------------------------------------------

echo "Starting EC2 Bootstrap..."

# 1. Update system packages
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    # Add ubuntu user to docker group
    sudo usermod -aG docker ubuntu
    echo "Docker installed. You may need to log out and log back in for group changes to take effect."
else
    echo "Docker already installed."
fi

# 3. Install Docker Compose plugin
echo "Installing Docker Compose..."
sudo apt-get install docker-compose-plugin -y

# 4. Install Nginx
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    sudo apt-get install nginx -y
else
    echo "Nginx already installed."
fi

# 5. Install Certbot
if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot..."
    sudo apt-get install certbot python3-certbot-nginx -y
else
    echo "Certbot already installed."
fi

echo "=========================================================="
echo "Bootstrap complete!"
echo "Next steps:"
echo "1. Clone your repo: git clone https://<your_PAT>@github.com/<org>/EmiratesErp.git"
echo "2. Copy .env.example to .env and fill in your secrets"
echo "3. Run 'docker compose up -d --build'"
echo "4. Issue SSL Certs using Certbot (DNS validation)"
echo "5. Move nginx/emirateserp.conf to /etc/nginx/sites-available/ and enable it"
echo "=========================================================="
