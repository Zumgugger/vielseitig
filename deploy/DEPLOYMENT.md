# Vielseitig Deployment Guide

## Quick Deployment to zumgugger.ch

### 1. Copy files to server

```bash
# On your local machine
rsync -avz --exclude='.venv' --exclude='node_modules' --exclude='__pycache__' \
  /path/to/vielseitig/ user@zumgugger.ch:/var/www/vielseitig/
```

Or clone from Git:
```bash
# On the server
cd /var/www
git clone https://github.com/yourusername/vielseitig.git
```

### 2. Run deployment script

```bash
cd /var/www/vielseitig
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

### 3. Configure environment

```bash
cd /var/www/vielseitig
nano .env
```

Update `SECRET_KEY` with a secure random string:
```bash
# Generate a secure key
openssl rand -hex 32
```

### 4. Change admin password

1. Go to https://vielseitig.zumgugger.ch/admin/login
2. Login with `admin` / `changeme`
3. Change password immediately

---

## Manual Deployment Steps

If the deployment script doesn't work, follow these steps:

### Prerequisites on server

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin

# Install Certbot
sudo apt install certbot python3-certbot-apache
```

### Build and start

```bash
cd /var/www/vielseitig

# Create .env file
cp .env.production.example .env
nano .env  # Update SECRET_KEY!

# Create data directory
mkdir -p data

# Build and start
docker compose build
docker compose up -d

# Run migrations
docker compose exec vielseitig alembic upgrade head

# Seed database
docker compose exec vielseitig python -m app.db.seed
```

### Configure Apache

```bash
# Copy config
sudo cp deploy/apache-vielseitig.conf /etc/apache2/sites-available/vielseitig.conf

# Enable modules
sudo a2enmod proxy proxy_http rewrite ssl headers

# Enable site
sudo a2ensite vielseitig.conf

# Get SSL certificate
sudo certbot certonly --apache -d vielseitig.zumgugger.ch

# Reload Apache
sudo systemctl reload apache2
```

---

## Useful Commands

```bash
# View logs
docker compose logs -f

# Restart app
docker compose restart

# Stop app
docker compose down

# Rebuild after code changes
docker compose build --no-cache
docker compose up -d

# Access container shell
docker compose exec vielseitig bash

# Run database migrations
docker compose exec vielseitig alembic upgrade head

# Check container status
docker compose ps
```

---

## Backup

### Database backup
```bash
# Backup SQLite database
cp /var/www/vielseitig/data/vielseitig.db /backup/vielseitig-$(date +%Y%m%d).db
```

### Automated daily backup (cron)
```bash
# Add to crontab
0 3 * * * cp /var/www/vielseitig/data/vielseitig.db /backup/vielseitig-$(date +\%Y\%m\%d).db
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Container won't start | Check logs: `docker compose logs` |
| 502 Bad Gateway | Container not running or wrong port |
| SSL error | Run certbot again |
| Database empty | Run `docker compose exec vielseitig python -m app.db.seed` |
| Permission denied | Check data directory ownership |
