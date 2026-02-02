#!/bin/bash
# Deployment script for Vielseitig
# Run this on the server: zumgugger.ch

set -e

APP_DIR="/var/www/vielseitig"
DOMAIN="vielseitig.zumgugger.ch"

echo "🚀 Deploying Vielseitig to $APP_DIR"

# Navigate to app directory
cd "$APP_DIR"

# Pull latest changes (if using git)
if [ -d ".git" ]; then
    echo "📥 Pulling latest changes..."
    git pull origin main
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚠️  Creating .env file - PLEASE UPDATE WITH REAL VALUES!"
    cp .env.production.example .env
    echo "❗ Edit .env with: nano $APP_DIR/.env"
fi

# Ensure data directory exists
mkdir -p data

# Build and start containers
echo "🐳 Building and starting Docker containers..."
docker compose down || true
docker compose build --no-cache
docker compose up -d

# Wait for container to be healthy
echo "⏳ Waiting for container to be healthy..."
sleep 5

# Run database migrations
echo "📊 Running database migrations..."
docker compose exec -T vielseitig alembic upgrade head

# Seed database (only if empty)
echo "🌱 Seeding database..."
docker compose exec -T vielseitig python -m app.db.seed

# Check if Apache config exists
if [ ! -f "/etc/apache2/sites-available/vielseitig.conf" ]; then
    echo "📝 Installing Apache configuration..."
    sudo cp deploy/apache-vielseitig.conf /etc/apache2/sites-available/vielseitig.conf
    sudo a2ensite vielseitig.conf
fi

# Enable required Apache modules
echo "🔧 Enabling Apache modules..."
sudo a2enmod proxy proxy_http rewrite ssl headers

# Get SSL certificate if not exists
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "🔐 Obtaining SSL certificate..."
    sudo certbot certonly --apache -d "$DOMAIN" --non-interactive --agree-tos --email admin@zumgugger.ch
fi

# Reload Apache
echo "🔄 Reloading Apache..."
sudo systemctl reload apache2

# Show status
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Status:"
docker compose ps
echo ""
echo "🔗 App available at: https://$DOMAIN"
echo ""
echo "📝 Useful commands:"
echo "   View logs:     docker compose logs -f"
echo "   Restart:       docker compose restart"
echo "   Stop:          docker compose down"
echo "   Shell:         docker compose exec vielseitig bash"
