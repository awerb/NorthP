#!/bin/bash

# Local Development Database Setup
# This script sets up a local PostgreSQL database for development

set -e

echo "🔧 Setting up local development database..."

# Default local database settings
DB_NAME="northpoint_dev"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

# Check if PostgreSQL is running locally
if ! pg_isready -h $DB_HOST -p $DB_PORT > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running on $DB_HOST:$DB_PORT"
    echo "   Please start PostgreSQL server first:"
    echo "   • macOS: brew services start postgresql"
    echo "   • Ubuntu: sudo service postgresql start"
    echo "   • Docker: docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres"
    exit 1
fi

# Create database if it doesn't exist
echo "📊 Creating database: $DB_NAME"
createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null || echo "Database already exists"

# Set DATABASE_URL for local development
export DATABASE_URL="postgresql://$DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"

echo "🗄️  Applying schema to local database..."

# Apply schema
if psql "$DATABASE_URL" < schema.sql; then
    echo "✅ Local development database ready!"
    echo ""
    echo "📝 Add this to your apps/api/.env file:"
    echo "DB_HOST=$DB_HOST"
    echo "DB_PORT=$DB_PORT"
    echo "DB_NAME=$DB_NAME"
    echo "DB_USER=$DB_USER"
    echo "DB_PASSWORD="
    echo ""
    echo "🚀 You can now run: npm run dev:api"
else
    echo "❌ Error setting up local database"
    exit 1
fi
