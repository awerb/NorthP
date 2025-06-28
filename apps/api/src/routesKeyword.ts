import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import gscClient from './utils/gscClient';

const router = Router();

// Initialize PostgreSQL connection
let pool: Pool | null = null;
let demoMode = false;

try {
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'northpoint',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  });
  
  // Test the connection
  pool.connect().catch((error) => {
    console.warn('PostgreSQL connection failed for keywords, enabling demo mode:', error.message);
    pool = null;
    demoMode = true;
  });
} catch (error) {
  console.warn('PostgreSQL not configured for keywords, running in demo mode');
  pool = null;
  demoMode = true;
}

// Initialize database table
const initDatabase = async () => {
  if (!pool || demoMode) {
    console.log('Running keyword routes in demo mode without database');
    return;
  }
  
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS keyword_snapshots (
        id SERIAL PRIMARY KEY,
        keyword TEXT NOT NULL,
        date DATE NOT NULL,
        clicks INTEGER DEFAULT 0,
        impressions INTEGER DEFAULT 0,
        ctr DECIMAL(5,4) DEFAULT 0,
        position DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(keyword, date)
      )
    `);
    
    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_keyword_snapshots_keyword ON keyword_snapshots(keyword);
      CREATE INDEX IF NOT EXISTS idx_keyword_snapshots_date ON keyword_snapshots(date);
      CREATE INDEX IF NOT EXISTS idx_keyword_snapshots_keyword_date ON keyword_snapshots(keyword, date);
    `);
    
    console.log('Keyword tracking database initialized');
  } catch (error) {
    console.error('Error initializing keyword database:', error);
  }
};

// Initialize on startup
initDatabase();

// In-memory storage for demo mode
let memorySnapshots: Array<{
  id: number;
  keyword: string;
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  created_at: string;
}> = [];
let nextId = 1;

// Target keywords to track
const TARGET_KEYWORDS = [
  "personal injury lawyer sf",
  "wrongful death lawyer sf", 
  "car accident attorney sf"
];

// Interface for keyword data
interface KeywordSnapshot {
  keyword: string;
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface KeywordTrend {
  keyword: string;
  data: Array<{
    date: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  alert: boolean;
  alertReason?: string;
}

// Helper function to store keyword snapshot
const storeSnapshot = async (snapshot: KeywordSnapshot): Promise<void> => {
  if (demoMode || !pool) {
    // Store in memory for demo mode
    const existing = memorySnapshots.find(s => s.keyword === snapshot.keyword && s.date === snapshot.date);
    if (!existing) {
      memorySnapshots.push({
        id: nextId++,
        ...snapshot,
        created_at: new Date().toISOString(),
      });
    }
    return;
  }
  
  try {
    await pool.query(`
      INSERT INTO keyword_snapshots (keyword, date, clicks, impressions, ctr, position) 
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (keyword, date) 
      DO UPDATE SET 
        clicks = EXCLUDED.clicks,
        impressions = EXCLUDED.impressions,
        ctr = EXCLUDED.ctr,
        position = EXCLUDED.position,
        created_at = NOW()
    `, [snapshot.keyword, snapshot.date, snapshot.clicks, snapshot.impressions, snapshot.ctr, snapshot.position]);
  } catch (error) {
    console.error('Error storing keyword snapshot:', error);
    throw error;
  }
};

// Helper function to get keyword trends
const getKeywordTrends = async (days: number = 90): Promise<KeywordTrend[]> => {
  let snapshots: any[] = [];
  
  if (demoMode || !pool) {
    // Use memory data for demo mode
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    snapshots = memorySnapshots.filter(s => new Date(s.date) >= cutoffDate);
  } else {
    try {
      const result = await pool.query(`
        SELECT * FROM keyword_snapshots 
        WHERE date >= CURRENT_DATE - INTERVAL '${days} days'
        ORDER BY keyword, date DESC
      `);
      snapshots = result.rows;
    } catch (error) {
      console.error('Error fetching keyword trends:', error);
      throw error;
    }
  }
  
  // Group by keyword
  const keywordGroups: { [key: string]: any[] } = {};
  for (const snapshot of snapshots) {
    if (!keywordGroups[snapshot.keyword]) {
      keywordGroups[snapshot.keyword] = [];
    }
    keywordGroups[snapshot.keyword].push(snapshot);
  }
  
  // Generate trends and alerts
  const trends: KeywordTrend[] = [];
  
  for (const [keyword, data] of Object.entries(keywordGroups)) {
    // Sort by date descending
    data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Check for position drop alert (position > 25 in last 3 days)
    let alert = false;
    let alertReason = '';
    
    const last3Days = data.slice(0, 3);
    if (last3Days.length >= 3) {
      const highPositions = last3Days.filter(d => d.position > 25);
      if (highPositions.length >= 3) {
        alert = true;
        alertReason = `Position dropped below 25 for 3 consecutive days (avg: ${(last3Days.reduce((sum, d) => sum + d.position, 0) / last3Days.length).toFixed(1)})`;
      }
    }
    
    trends.push({
      keyword,
      data: data.map(d => ({
        date: d.date,
        clicks: d.clicks,
        impressions: d.impressions,
        ctr: d.ctr,
        position: d.position,
      })),
      alert,
      alertReason,
    });
  }
  
  return trends;
};

// POST /keywords/update - Pull data from GSC and update database
router.post('/update', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!gscClient.isInitialized()) {
      res.status(500).json({ 
        error: 'Google Search Console client not initialized',
        message: 'GSC_SERVICE_KEY not configured or invalid'
      });
      return;
    }

    console.log('Fetching keyword data from Google Search Console...');
    
    // Fetch data for last 90 days
    const keywordData = await gscClient.getKeywordData(TARGET_KEYWORDS, 90);
    
    console.log(`Fetched ${keywordData.length} keyword data points`);
    
    // Store each snapshot
    let storedCount = 0;
    for (const data of keywordData) {
      try {
        await storeSnapshot({
          keyword: data.keyword,
          date: data.date,
          clicks: data.clicks,
          impressions: data.impressions,
          ctr: data.ctr,
          position: data.position,
        });
        storedCount++;
      } catch (error) {
        console.error('Error storing snapshot:', error);
      }
    }
    
    res.json({
      success: true,
      message: `Updated keyword data for ${TARGET_KEYWORDS.length} keywords`,
      keywords: TARGET_KEYWORDS,
      dataPoints: keywordData.length,
      stored: storedCount,
      demo: demoMode,
    });
  } catch (error) {
    console.error('Error updating keyword data:', error);
    res.status(500).json({ 
      error: 'Failed to update keyword data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /keywords/trends - Get latest 90 days with alerts
router.get('/trends', async (req: Request, res: Response): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 90;
    const trends = await getKeywordTrends(days);
    
    // Calculate summary stats
    const totalKeywords = trends.length;
    const alertCount = trends.filter(t => t.alert).length;
    
    res.json({
      success: true,
      trends,
      summary: {
        totalKeywords,
        alertCount,
        period: `${days} days`,
        demo: demoMode,
      },
    });
  } catch (error) {
    console.error('Error fetching keyword trends:', error);
    res.status(500).json({ 
      error: 'Failed to fetch keyword trends',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /keywords/status - Check GSC connection status
router.get('/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const gscInitialized = gscClient.isInitialized();
    let gscAuthenticated = false;
    
    if (gscInitialized) {
      try {
        gscAuthenticated = await gscClient.authenticate();
      } catch (error) {
        console.error('GSC authentication test failed:', error);
      }
    }
    
    res.json({
      success: true,
      status: {
        gscInitialized,
        gscAuthenticated,
        demoMode,
        targetKeywords: TARGET_KEYWORDS,
        memorySnapshots: demoMode ? memorySnapshots.length : 'N/A',
      },
    });
  } catch (error) {
    console.error('Error checking keyword status:', error);
    res.status(500).json({ 
      error: 'Failed to check status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test route
router.get('/test', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Keyword tracking routes are working',
    demo: demoMode,
    targetKeywords: TARGET_KEYWORDS,
    memorySnapshots: demoMode ? memorySnapshots.length : 'N/A',
  });
});

export default router;
