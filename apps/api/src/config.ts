import dotenv from 'dotenv';

// Load environment variables as early as possible
dotenv.config();

// Export commonly used environment variables
export const config = {
  gscApiKey: process.env.GSC_API_KEY,
  gscServiceKey: process.env.GSC_SERVICE_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  newsApiKey: process.env.NEWS_API_KEY,
  eventRegistryApiKey: process.env.EVENT_REGISTRY_API_KEY,
  databaseUrl: process.env.DATABASE_URL,
  port: process.env.PORT || 3002,
};
