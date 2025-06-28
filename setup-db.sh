#!/bin/bash

# NorthPoint Legal Tech - Database Setup Script
# This script initializes the PostgreSQL database with the complete schema

set -e  # Exit on any error

echo "🚀 Setting up NorthPoint Legal Tech Database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "   Please set it to your PostgreSQL connection string:"
    echo "   export DATABASE_URL='postgresql://user:password@host:port/database'"
    exit 1
fi

# Verify psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql command not found"
    echo "   Please install PostgreSQL client tools"
    exit 1
fi

echo "📊 Applying database schema..."

# Apply the schema
if psql "$DATABASE_URL" < schema.sql; then
    echo "✅ Database schema applied successfully!"
    echo ""
    echo "📋 Database includes:"
    echo "   • Referral management tables"
    echo "   • AI ranking tracking"
    echo "   • Keyword monitoring (GSC integration)"
    echo "   • News article tracking"
    echo "   • Social media content management"
    echo "   • All necessary indexes and seed data"
    echo ""
    echo "🎉 Database is ready for NorthPoint Legal Tech App!"
else
    echo "❌ Error applying database schema"
    exit 1
fi
