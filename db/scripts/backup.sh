#!/bin/bash

# Backup the database
export PGUSER=postgres
export PGPASSWORD=postgres2416
export PGDATABASE=ponto
export PGHOST=db

# Get the current date
date=$(date +"%Y-%m-%d")

# Get the current hour
hour=$(date +"%H")

# Check if the current hour is between 22:00 and 03:00
if [[ "$current_hour" -ge "22" || "$current_hour" -lt "03" ]]; then
    # Directory to store backups
    backup_dir="/backup"

    # Name of the backup file
    date=$(date +"%Y-%m-%d_%H%M%S")
    backup_file="$backup_dir/ponto_backup_$date.backup"

    # Create the backup
    pg_dump -Fc > "$backup_file"

    # Remove old backups
    find "$backup_dir" -type f -name '*.backup' -mtime +7 -exec rm {} \;
fi