import express from 'express';
import dotenv from 'dotenv';
import socialRoutes from './routesSocial';
import newsRoutes from './routesNews';
import referralRoutes from './routesReferral';
import aiRankRoutes from './routesAiRank';
import keywordRoutes from './routesKeyword';
import unionRoutes from './routesUnion';

// Configure dotenv to load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Add express.json() middleware
app.use(express.json());

// Add a simple test route
app.get('/', (req, res) => {
  res.json({ message: 'API server is running!' });
});

// Mount router from './routesSocial' at the path '/social'
app.use('/social', socialRoutes);

// Mount router from './routesNews' at the path '/news'
app.use('/news', newsRoutes);

// Mount router from './routesReferral' at the path '/referral'
app.use('/referral', referralRoutes);

// Mount router from './routesAiRank' at the path '/ai'
app.use('/ai', aiRankRoutes);

// Mount router from './routesKeyword' at the path '/keywords'
app.use('/keywords', keywordRoutes);

// Mount router from './routesUnion' at the path '/union'
app.use('/union', unionRoutes);

// Listen on port 3002 and log message
app.listen(3002, () => {
  console.log('API running on http://localhost:3002');
});
