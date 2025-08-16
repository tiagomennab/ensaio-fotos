#!/bin/bash

# Database Backup Script for Ensaio Fotos
# This script creates automated backups of the PostgreSQL database

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Parse DATABASE_URL
parse_database_url() {
    if [ -z "$DATABASE_URL" ]; then
        print_error "DATABASE_URL environment variable is not set"
        exit 1
    fi
    
    # Extract components from DATABASE_URL
    # Format: postgresql://user:password@host:port/database
    DB_URL_REGEX="postgresql://([^:]+):([^@]+)@([^:]+):([0-9]+)/(.+)"
    
    if [[ $DATABASE_URL =~ $DB_URL_REGEX ]]; then
        DB_USER="${BASH_REMATCH[1]}"
        DB_PASS="${BASH_REMATCH[2]}"
        DB_HOST="${BASH_REMATCH[3]}"
        DB_PORT="${BASH_REMATCH[4]}"
        DB_NAME="${BASH_REMATCH[5]}"
    else
        print_error "Invalid DATABASE_URL format"
        exit 1
    fi
}

# Create backup directory
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        print_status "Created backup directory: $BACKUP_DIR"
    fi
}

# Perform database backup
backup_database() {
    local backup_file="$BACKUP_DIR/ensaio_fotos_backup_$TIMESTAMP.sql"
    
    print_status "Starting database backup..."
    print_status "Backup file: $backup_file"
    
    export PGPASSWORD="$DB_PASS"
    
    if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --verbose \
        --format=custom \
        --compress=9 \
        --file="$backup_file.dump"; then
        
        print_status "Database backup completed successfully ✓"
        
        # Also create a plain SQL backup for easier inspection
        pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
            --verbose \
            --format=plain \
            --file="$backup_file"
        
        # Compress the SQL file
        gzip "$backup_file"
        
        print_status "SQL backup created and compressed: $backup_file.gz"
        
        # Get file sizes
        dump_size=$(du -h "$backup_file.dump" | cut -f1)
        sql_size=$(du -h "$backup_file.gz" | cut -f1)
        
        print_status "Backup sizes - Custom format: $dump_size, SQL format: $sql_size"
        
    else
        print_error "Database backup failed"
        exit 1
    fi
    
    unset PGPASSWORD
}

# Cleanup old backups
cleanup_old_backups() {
    print_status "Cleaning up backups older than $RETENTION_DAYS days..."
    
    find "$BACKUP_DIR" -name "ensaio_fotos_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "ensaio_fotos_backup_*.sql.dump" -mtime +$RETENTION_DAYS -delete
    
    print_status "Old backups cleaned up ✓"
}

# Verify backup integrity
verify_backup() {
    local backup_file="$BACKUP_DIR/ensaio_fotos_backup_$TIMESTAMP.sql.dump"
    
    print_status "Verifying backup integrity..."
    
    export PGPASSWORD="$DB_PASS"
    
    if pg_restore --list "$backup_file" > /dev/null 2>&1; then
        print_status "Backup integrity verified ✓"
    else
        print_error "Backup integrity check failed"
        exit 1
    fi
    
    unset PGPASSWORD
}

# Upload to cloud storage (optional)
upload_to_cloud() {
    if [ "$CLOUD_BACKUP_ENABLED" = "true" ]; then
        print_status "Uploading backup to cloud storage..."
        
        local backup_files=(
            "$BACKUP_DIR/ensaio_fotos_backup_$TIMESTAMP.sql.gz"
            "$BACKUP_DIR/ensaio_fotos_backup_$TIMESTAMP.sql.dump"
        )
        
        if [ "$STORAGE_PROVIDER" = "aws" ] && [ ! -z "$AWS_S3_BACKUP_BUCKET" ]; then
            for file in "${backup_files[@]}"; do
                if [ -f "$file" ]; then
                    aws s3 cp "$file" "s3://$AWS_S3_BACKUP_BUCKET/database-backups/"
                    print_status "Uploaded $(basename "$file") to S3 ✓"
                fi
            done
        else
            print_warning "Cloud backup configured but provider not supported or credentials missing"
        fi
    fi
}

# Send notification (optional)
send_notification() {
    if [ ! -z "$BACKUP_WEBHOOK_URL" ]; then
        local status="success"
        local message="Database backup completed successfully at $TIMESTAMP"
        
        curl -X POST "$BACKUP_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{
                \"status\": \"$status\",
                \"message\": \"$message\",
                \"timestamp\": \"$TIMESTAMP\",
                \"database\": \"$DB_NAME\"
            }" > /dev/null 2>&1 || print_warning "Failed to send backup notification"
    fi
}

# Main execution
main() {
    print_status "Starting database backup for Ensaio Fotos..."
    
    parse_database_url
    create_backup_dir
    backup_database
    verify_backup
    cleanup_old_backups
    upload_to_cloud
    send_notification
    
    print_status "🎉 Database backup completed successfully!"
    print_status "Backup files created in: $BACKUP_DIR"
}

# Run main function
main "$@"