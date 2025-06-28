# Google Search Console Setup Instructions

## Prerequisites
1. Access to Google Search Console for your website
2. Google Cloud Platform project with Search Console API enabled
3. Service account with appropriate permissions

## Step-by-Step Setup

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the Google Search Console API

### 2. Create Service Account
1. Go to IAM & Admin > Service Accounts
2. Click "Create Service Account"
3. Provide name: `northpoint-gsc-service`
4. Grant role: `Service Account User`
5. Create and download JSON key file

### 3. Configure Google Search Console
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add the service account email as a user with "Full" permissions
3. Verify your website property

### 4. Update Configuration
1. Replace the placeholder content in `apps/api/keys/gsc-service-key.json`
2. Update the website URL in `apps/api/src/utils/gscClient.ts`
3. Restart the API server

### 5. Environment Variables
```bash
GSC_SERVICE_KEY=apps/api/keys/gsc-service-key.json
```

## Testing
After setup, test the connection:
```bash
curl http://localhost:3002/keywords/status
```

Should return:
```json
{
  "gscInitialized": true,
  "gscAuthenticated": true,
  "demoMode": false
}
```

## Demo Mode
Currently running in demo mode with sample data.
The Keywords page will show simulated keyword performance data until GSC is properly configured.
