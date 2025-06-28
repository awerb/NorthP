# Deployment Configuration

## ✅ Completed Setup

### Git Repository
- [x] Initialized Git repository
- [x] Created comprehensive .gitignore
- [x] Initial commit with full codebase
- [x] README with deployment instructions
- [ ] GitHub repository creation (manual step required)
- [ ] Push to GitHub main branch

### Netlify Configuration (Frontend)
- [x] `netlify.toml` created with build configuration
- [x] Build command: `pnpm --filter=web build`
- [x] Publish directory: `apps/web/dist`
- [x] Node.js version specified: 18
- [ ] Connect to GitHub repository (after GitHub setup)
- [ ] Configure environment variables (if needed)

### Railway Configuration (Backend)
- [x] Root `package.json` with Railway start script
- [x] Start command: `pnpm --filter=api dev`
- [x] Workspace configuration for monorepo
- [ ] Connect to GitHub repository (after GitHub setup)
- [ ] Configure environment variables:
  - OPENAI_API_KEY
  - ANTHROPIC_API_KEY
  - GEMINI_API_KEY
  - COHERE_API_KEY
  - EVENT_REGISTRY_API_KEY
  - NEWS_API_KEY
  - GSC_SERVICE_KEY (base64 encoded service account JSON)
  - Database credentials (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)

## 📋 Next Steps

### 1. Create GitHub Repository
```bash
# Go to github.com and create a new repository named "northpoint-legal-tech"
# Then run these commands:

git remote add origin https://github.com/YOUR_USERNAME/northpoint-legal-tech.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Netlify
1. Go to netlify.com
2. Click "New site from Git"
3. Connect to your GitHub repository
4. Netlify will auto-detect the `netlify.toml` configuration
5. Deploy will automatically trigger on main branch pushes

### 3. Deploy to Railway
1. Go to railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway will auto-detect the Node.js project
6. Add environment variables in Railway dashboard
7. Deploy will automatically trigger on main branch pushes

### 4. Configure Environment Variables
Set these in Railway dashboard for production:
- All API keys and credentials
- Database connection details
- GSC service account key (base64 encoded)

## 🚀 Auto-Deployment
Both Netlify and Railway are configured for auto-deployment:
- **Trigger**: Push to main branch
- **Frontend**: Builds and deploys to Netlify CDN
- **Backend**: Deploys and runs on Railway servers
- **Zero-downtime**: Both platforms support rolling deployments
