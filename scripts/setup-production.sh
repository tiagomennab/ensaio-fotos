#!/bin/bash

# Production Setup Script for Ensaio Fotos
# This script sets up the production environment

set -e

echo "🚀 Setting up Ensaio Fotos for production..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required environment variables are set
check_env_vars() {
    print_status "Checking required environment variables..."
    
    required_vars=(
        "DATABASE_URL"
        "NEXTAUTH_SECRET"
        "NEXTAUTH_URL"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        exit 1
    fi
    
    print_status "All required environment variables are set ✓"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm ci --only=production
    print_status "Dependencies installed ✓"
}

# Generate Prisma client
generate_prisma() {
    print_status "Generating Prisma client..."
    npx prisma generate
    print_status "Prisma client generated ✓"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    npx prisma migrate deploy
    print_status "Database migrations completed ✓"
}

# Create initial admin user (if needed)
create_admin_user() {
    print_status "Checking for admin user..."
    
    if [ ! -z "$ADMIN_EMAIL" ]; then
        node -e "
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        async function createAdmin() {
            const existing = await prisma.user.findUnique({
                where: { email: '$ADMIN_EMAIL' }
            });
            
            if (!existing) {
                await prisma.user.create({
                    data: {
                        email: '$ADMIN_EMAIL',
                        name: 'Admin',
                        plan: 'GOLD',
                        credits: 10000,
                        status: 'ACTIVE'
                    }
                });
                console.log('Admin user created');
            } else {
                console.log('Admin user already exists');
            }
            
            await prisma.\$disconnect();
        }
        
        createAdmin().catch(console.error);
        "
        print_status "Admin user setup completed ✓"
    else
        print_warning "ADMIN_EMAIL not set, skipping admin user creation"
    fi
}

# Build the application
build_app() {
    print_status "Building the application..."
    npm run build
    print_status "Application built ✓"
}

# Verify health check
verify_health() {
    print_status "Starting health check verification..."
    
    # Start the app in background
    npm start &
    APP_PID=$!
    
    # Wait a bit for the app to start
    sleep 10
    
    # Check health endpoint
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        print_status "Health check passed ✓"
        kill $APP_PID
        wait $APP_PID 2>/dev/null || true
    else
        print_error "Health check failed ✗"
        kill $APP_PID 2>/dev/null || true
        wait $APP_PID 2>/dev/null || true
        exit 1
    fi
}

# Setup SSL certificates (if in SSL mode)
setup_ssl() {
    if [ "$SSL_ENABLED" = "true" ]; then
        print_status "Setting up SSL certificates..."
        
        if [ ! -d "ssl" ]; then
            mkdir ssl
        fi
        
        if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
            print_warning "SSL certificates not found. Generating self-signed certificates..."
            openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes \
                -subj "/C=BR/ST=SP/L=São Paulo/O=Ensaio Fotos/CN=localhost"
            print_status "Self-signed SSL certificates generated ✓"
        else
            print_status "SSL certificates found ✓"
        fi
    fi
}

# Setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring..."
    
    # Create logs directory
    mkdir -p logs
    
    # Setup log rotation
    if command -v logrotate >/dev/null 2>&1; then
        cat > /etc/logrotate.d/ensaio-fotos << EOF
$(pwd)/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
}
EOF
        print_status "Log rotation configured ✓"
    else
        print_warning "logrotate not found, skipping log rotation setup"
    fi
}

# Main execution
main() {
    print_status "Starting production setup for Ensaio Fotos..."
    
    check_env_vars
    install_dependencies
    generate_prisma
    run_migrations
    create_admin_user
    build_app
    setup_ssl
    setup_monitoring
    
    # Skip health check if in Docker build
    if [ "$SKIP_HEALTH_CHECK" != "true" ]; then
        verify_health
    fi
    
    print_status "🎉 Production setup completed successfully!"
    print_status "You can now start the application with: npm start"
    
    if [ "$SSL_ENABLED" = "true" ]; then
        print_status "SSL is enabled. App will be available at: https://localhost"
    else
        print_status "App will be available at: http://localhost:3000"
    fi
}

# Run main function
main "$@"