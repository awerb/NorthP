# Netlify Frontend Deployment Guide

## Build Configuration

### Netlify Dashboard Settings
When setting up your site in Netlify, use these exact settings:

```
Base directory: apps/web
Build command: pnpm run build
Publish directory: dist
```

### Automatic Configuration
The `netlify.toml` file in the project root automatically configures these settings:

```toml
[build]
base = "apps/web"
command = "pnpm run build"
publish = "dist"

[build.environment]
NODE_VERSION = "18"
```

## Deployment Steps

### 1. Connect Repository
1. Go to [Netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub account
4. Select your Northpoint repository
5. Configure build settings (as shown above)

### 2. Environment Variables
Add these environment variables in Netlify dashboard (Site settings → Environment variables):

```
VITE_API_URL=https://your-railway-app.railway.app
```

Replace `your-railway-app.railway.app` with your actual Railway backend URL.

### 3. Build Process
Netlify will automatically:
1. Navigate to `apps/web` directory
2. Install dependencies with `pnpm install`
3. Run `pnpm run build` to build the React app
4. Publish the `dist` folder contents

### 4. Custom Domain (Optional)
1. In Netlify dashboard, go to Domain settings
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificates are automatically provisioned

## Frontend Features

The deployed frontend includes:
- ✅ **Modern React 19** with TypeScript
- ✅ **Tailwind CSS v4** with custom Northpoint branding
- ✅ **Responsive Design** for mobile and desktop
- ✅ **Professional UI** with consistent layout
- ✅ **AI Integration** for ranking and content generation
- ✅ **Real-time Updates** from backend APIs
- ✅ **SEO Optimized** with proper meta tags

## Pages Available After Deployment

- `/` - Dashboard with quick actions and system status
- `/social-media-lab` - AI-powered social media content generation
- `/referral-nurture` - Attorney referral management system
- `/news-radar` - Legal news monitoring and updates
- `/ai-visibility-checker` - AI model ranking analysis
- `/keyword-monitor` - Google Search Console integration
- `/union-strong` - Union-related legal resources
- `/creative-playground` - Additional tools and features

## API Integration

The frontend automatically connects to your Railway backend API. Ensure:

1. **Backend URL**: Set `VITE_API_URL` environment variable in Netlify
2. **CORS**: Backend allows requests from your Netlify domain
3. **API Keys**: All necessary API keys are configured in Railway
4. **Database**: PostgreSQL is connected and schema is initialized

## Troubleshooting

### Build Failures
- **pnpm not found**: Netlify automatically detects pnpm from lockfile
- **TypeScript errors**: Fix any TS compilation errors in the code
- **Missing environment variables**: Ensure VITE_API_URL is set

### Runtime Issues
- **API calls failing**: Check backend URL and CORS configuration
- **Blank pages**: Check browser console for JavaScript errors
- **Styling issues**: Verify Tailwind CSS is building correctly

### Performance
- **Bundle size**: The app is optimized with Vite's production build
- **Loading speed**: Static assets are served via Netlify's global CDN
- **Caching**: Proper cache headers are set for optimal performance

## Deployment Commands

For manual deployment or testing:

```bash
# Install dependencies
cd apps/web
pnpm install

# Build for production
pnpm run build

# Preview build locally
pnpm run preview

# Deploy to Netlify (if using Netlify CLI)
netlify deploy --prod --dir=dist
```

## Auto-Deployment

With the repository connected:
- ✅ **Push to main branch** → Automatic deployment
- ✅ **Pull requests** → Deploy previews (optional)
- ✅ **Build notifications** → Slack/email integration (optional)

The frontend is now ready for production use with professional Northpoint branding and full API integration! 🚀
