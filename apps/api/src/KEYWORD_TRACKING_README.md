# Keyword Tracking API Documentation

This module provides Google Search Console integration for tracking keyword performance for Northpoint Trial Law.

## Overview

The keyword tracking system monitors specific target keywords for the website `https://northpointtriallaw.com/` and stores historical data for trend analysis and alerts.

## Target Keywords

The system tracks the following keywords:
- "personal injury lawyer sf"
- "wrongful death lawyer sf" 
- "car accident attorney sf"

## API Endpoints

### Base Path: `/keywords`

#### `POST /update`
Fetches fresh data from Google Search Console for the last 90 days and updates the database.

**Response:**
```json
{
  "success": true,
  "message": "Updated keyword data for 3 keywords",
  "keywords": ["personal injury lawyer sf", "wrongful death lawyer sf", "car accident attorney sf"],
  "dataPoints": 42,
  "stored": 42,
  "demo": false
}
```

#### `GET /trends`
Returns keyword performance trends for the last 90 days with alerts.

**Query Parameters:**
- `days` (optional): Number of days to fetch (default: 90)

**Response:**
```json
{
  "success": true,
  "trends": [
    {
      "keyword": "personal injury lawyer sf",
      "data": [
        {
          "date": "2025-06-27",
          "clicks": 12,
          "impressions": 1500,
          "ctr": 0.008,
          "position": 8.5
        }
      ],
      "alert": false
    }
  ],
  "summary": {
    "totalKeywords": 3,
    "alertCount": 0,
    "period": "90 days",
    "demo": false
  }
}
```

#### `GET /status`
Returns the current status of GSC integration and database connection.

**Response:**
```json
{
  "success": true,
  "status": {
    "gscInitialized": true,
    "gscAuthenticated": true,
    "demoMode": false,
    "targetKeywords": ["personal injury lawyer sf", "wrongful death lawyer sf", "car accident attorney sf"],
    "memorySnapshots": "N/A"
  }
}
```

#### `GET /test`
Simple test endpoint to verify the routes are working.

## Configuration

### Environment Variables

- `GSC_SERVICE_KEY`: Base64-encoded Google Search Console service account JSON key
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: PostgreSQL database connection

### Google Search Console Setup

1. Create a service account in Google Cloud Console
2. Enable the Search Console API
3. Add the service account email to your Search Console property
4. Download the service account JSON key
5. Base64 encode the JSON and set as `GSC_SERVICE_KEY`

## Database Schema

### `keyword_snapshots` Table

```sql
CREATE TABLE keyword_snapshots (
  id SERIAL PRIMARY KEY,
  keyword TEXT NOT NULL,
  date DATE NOT NULL,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr DECIMAL(5,4) DEFAULT 0,
  position DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(keyword, date)
);
```

## Alerts

The system generates alerts when:
- A keyword's position drops above 25 for 3 consecutive days

## Demo Mode

When database or GSC credentials are not available, the system runs in demo mode:
- Uses in-memory storage for testing
- Returns sample responses
- Graceful degradation of functionality

## Testing

```bash
# Test basic functionality
curl http://localhost:3002/keywords/test

# Check status
curl http://localhost:3002/keywords/status

# Get trends (empty in demo mode)
curl http://localhost:3002/keywords/trends

# Try to update (will fail without GSC credentials)
curl -X POST http://localhost:3002/keywords/update
```
