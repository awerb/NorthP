# Northpoint Legal-Tech App

A comprehensive legal technology application built for Northpoint Trial Law, featuring AI-powered content generation, referral management, news monitoring, and SEO tracking.

## 🏗️ Architecture

### Backend (Express API)
- **Port**: 3002
- **Language**: TypeScript
- **Database**: PostgreSQL (with demo mode fallback)
- **AI Services**: OpenAI GPT-4, Anthropic Claude, Google Gemini, Cohere

### Frontend (React SPA)
- **Port**: 5173 (dev)
- **Framework**: React + TypeScript + Vite
- **Styling**: Tailwind CSS with custom Northpoint branding
- **Routing**: React Router DOM

## 🚀 Features

### 1. Social Media Lab (`/social-media-lab`)
- AI-powered tweet generation for legal content
- OpenAI GPT-4 integration
- Copy-to-clipboard functionality
- Character count tracking

### 2. Referral Nurture (`/referral-nurture`)
- CSV upload for attorney contact lists
- Automated email draft generation based on news
- PostgreSQL storage with upsert functionality
- Donut chart visualization of draft status
- Send/track email campaign management

### 3. News Radar (`/news-radar`)
- Event Registry API integration for legal news
- Automated deduplication and tagging
- Demo mode with sample data
- Real-time news monitoring

### 4. AI Visibility Checker (`/ai-visibility-checker`)
- Multi-model AI ranking analysis
- Tracks Northpoint's ranking across GPT-4, Claude, Gemini, Cohere
- Query: "Who are the best personal injury lawyers in San Francisco?"
- Score tracking and trend analysis

### 5. Keyword Monitor (`/keyword-monitor`)
- Google Search Console API integration
- Target keywords: "personal injury lawyer sf", "wrongful death lawyer sf", "car accident attorney sf"
- 90-day trend tracking
- Alert system for ranking drops (position > 25 for 3+ days)

### 6. Dashboard (`/`)
- System status overview
- Quick action buttons
- Recent activity feed
- Service health monitoring

## 🎨 Design System

### Brand Colors
- **Primary Blue**: `#2355FF` (np-blue)
- **White**: `#FFFFFF` (np-white)
- **Black**: `#000000` (np-black)
- **Light Gray**: `#F2F2F2` (np-gray)

### Typography
- **Primary**: Instrument Sans (clean, modern)
- **Serif**: Cormorant Garamond (elegant, legal)

### Components
- Custom SVG logo with legal scales icon
- Breadcrumb navigation
- Consistent card layouts
- Responsive grid systems

## 🛠️ Development

### Prerequisites
- Node.js 18+
- pnpm
- PostgreSQL (optional, demo mode available)

### Installation
```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev:api    # Backend on :3002
pnpm dev:web    # Frontend on :5173
```

### Environment Variables
Create `apps/api/.env`:
```env
# AI Services
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GEMINI_API_KEY=your_gemini_key
COHERE_API_KEY=your_cohere_key

# News APIs
EVENT_REGISTRY_API_KEY=your_event_registry_key
NEWS_API_KEY=your_news_api_key

# Google Search Console
GSC_SERVICE_KEY=your_base64_service_account_json

# Database (optional)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=northpoint
DB_USER=postgres
DB_PASSWORD=your_password
```

## 🚢 Deployment

### Netlify (Frontend)
- **Build Command**: `pnpm --filter=web build`
- **Publish Directory**: `apps/web/dist`
- **Auto-deploy**: Enabled on main branch push

### Railway (Backend)
- **Start Command**: `pnpm --filter=api dev`
- **Auto-deploy**: Enabled on main branch push
- **Environment Variables**: Set in Railway dashboard

### Database Setup
```sql
-- Run the migration script
psql $DATABASE_URL -f apps/api/scripts/initReferral.sql
```

## 📊 API Endpoints

### Social Media
- `POST /social/generate` - Generate tweet captions

### News
- `GET /news` - Fetch legal industry news
- `GET /news/demo` - Demo mode with sample data

### Referrals
- `POST /referral/upload` - Upload CSV of attorneys
- `POST /referral/check` - Check for news updates and generate emails
- `GET /referral/outbox` - Get drafted emails
- `POST /referral/send/:id` - Send individual email

### AI Rankings
- `POST /ai/rank` - Query all AI models and score responses
- `GET /ai/scores` - Get historical ranking data

### Keywords
- `POST /keywords/update` - Pull GSC data for target keywords
- `GET /keywords/trends` - Get 90-day keyword performance
- `GET /keywords/status` - Check GSC connection status

## 🧪 Demo Mode

All services gracefully degrade to demo mode when:
- Database credentials not available
- API keys not configured
- External services unreachable

Demo mode provides realistic sample data for testing and development.

## 📝 Tech Stack

**Backend:**
- Express.js + TypeScript
- PostgreSQL with pg driver
- OpenAI, Anthropic, Google AI APIs
- Event Registry & NewsAPI
- Google Search Console API
- Multer for file uploads
- CSV parsing utilities

**Frontend:**
- React 19 + TypeScript
- Vite build tool
- Tailwind CSS
- React Router DOM
- Recharts for data visualization
- Axios for API calls

**Development:**
- ESLint + TypeScript ESLint
- pnpm workspaces
- Hot reload for both frontend and backend

## 📄 License

MIT License - Built for Northpoint Trial Law
