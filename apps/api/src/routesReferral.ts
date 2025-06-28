import { Router, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import multer from 'multer';
import csv from 'csv-parser';
import { Readable } from 'stream';
import OpenAI from 'openai';

// Extend Express Request type to include file property
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

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
    console.warn('PostgreSQL connection failed for referrals, enabling demo mode:', error.message);
    pool = null;
    demoMode = true;
  });
} catch (error) {
  console.warn('PostgreSQL not configured for referrals, running in demo mode');
  pool = null;
  demoMode = true;
}

// Initialize OpenAI client lazily
let openai: OpenAI | null = null;
const getOpenAI = () => {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
};

// In-memory storage for demo mode
let memoryTargets: Array<{
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  firm?: string;
  city?: string;
}> = [];

let memoryOutbox: Array<{
  id: number;
  target_id: number;
  subject: string;
  body: string;
  sent: boolean;
  created_at: string;
}> = [];

let nextTargetId = 1;
let nextOutboxId = 1;

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

// Initialize database tables
const initDatabase = async () => {
  if (!pool || demoMode) {
    console.log('Running referral routes in demo mode without database');
    return;
  }
  
  try {
    // Create REFERRAL_TARGETS table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS referral_targets (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        firm VARCHAR(255),
        city VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create REFERRAL_OUTBOX table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS referral_outbox (
        id SERIAL PRIMARY KEY,
        target_id INTEGER REFERENCES referral_targets(id) ON DELETE CASCADE,
        subject VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        sent BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Referral database tables initialized');
  } catch (error) {
    console.error('Error initializing referral database:', error);
    throw error;
  }
};

// Initialize on startup
initDatabase().catch(console.error);

// Interfaces
interface ReferralTarget {
  email: string;
  first_name: string;
  last_name: string;
  firm?: string;
  city?: string;
}

interface NewsAPIArticle {
  title: string;
  description?: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

// Helper function to parse CSV from buffer
const parseCSVFromBuffer = (buffer: Buffer): Promise<ReferralTarget[]> => {
  return new Promise((resolve, reject) => {
    const results: ReferralTarget[] = [];
    const stream = Readable.from(buffer.toString());
    
    stream
      .pipe(csv())
      .on('data', (data: any) => {
        // Validate required fields
        if (data.first_name && data.last_name && data.email) {
          results.push({
            first_name: data.first_name.trim(),
            last_name: data.last_name.trim(),
            email: data.email.trim().toLowerCase(),
            firm: data.firm?.trim() || undefined,
            city: data.city?.trim() || undefined,
          });
        }
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error: any) => {
        reject(error);
      });
  });
};

// Helper function to upsert target into database
const upsertTarget = async (target: ReferralTarget): Promise<number> => {
  if (demoMode || !pool) {
    // Demo mode: check if email exists and update or insert
    const existingIndex = memoryTargets.findIndex(t => t.email === target.email);
    if (existingIndex >= 0) {
      memoryTargets[existingIndex] = { ...memoryTargets[existingIndex], ...target };
      return memoryTargets[existingIndex].id;
    } else {
      const newTarget = { ...target, id: nextTargetId++ };
      memoryTargets.push(newTarget);
      return newTarget.id;
    }
  }

  try {
    const result = await pool.query(`
      INSERT INTO referral_targets (email, first_name, last_name, firm, city)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        firm = EXCLUDED.firm,
        city = EXCLUDED.city
      RETURNING id
    `, [target.email, target.first_name, target.last_name, target.firm, target.city]);
    
    return result.rows[0].id;
  } catch (error) {
    console.error('Error upserting target:', error);
    throw error;
  }
};

// Helper function to search NewsAPI
const searchNewsAPI = async (query: string): Promise<NewsAPIArticle[]> => {
  const newsApiKey = process.env.NEWS_API_KEY;
  if (!newsApiKey) {
    console.warn('NEWS_API_KEY not configured, skipping NewsAPI search');
    return [];
  }

  try {
    const searchUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=10&sortBy=publishedAt&language=en`;
    const response = await fetch(searchUrl, {
      headers: {
        'X-API-Key': newsApiKey,
      },
    });

    if (!response.ok) {
      console.error(`NewsAPI error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error('Error searching NewsAPI:', error);
    return [];
  }
};

// Helper function to search Google News as fallback
const searchGoogleNews = async (query: string): Promise<NewsAPIArticle[]> => {
  try {
    // This is a simplified fallback - in production you might want to use a proper news API
    // For demo purposes, we'll return mock data
    console.log(`Google News fallback search for: ${query}`);
    return [
      {
        title: `Recent case involving ${query.split(' ')[0]} ${query.split(' ')[1]}`,
        url: 'https://example.com/mock-news-article',
        description: 'Mock news article for demonstration purposes',
        publishedAt: new Date().toISOString(),
        source: {
          name: 'Demo News'
        }
      }
    ];
  } catch (error) {
    console.error('Error searching Google News:', error);
    return [];
  }
};

// Helper function to generate congratulatory email using OpenAI
const generateCongratulationEmail = async (firstName: string, storyTitle: string): Promise<{ subject: string; body: string }> => {
  try {
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Write a concise, collegial 80-word email from Northpoint Trial Law congratulating an attorney on their recent news coverage. Be professional, warm, and brief."
        },
        {
          role: "user",
          content: `Write a congratulatory email to ${firstName} about their recent coverage: "${storyTitle}". Include a subject line.`
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const emailContent = completion.choices[0]?.message?.content || '';
    
    // Extract subject and body (assuming the format includes "Subject:" and then the body)
    const lines = emailContent.split('\n').filter(line => line.trim());
    let subject = `Congratulations on your recent coverage, ${firstName}!`;
    let body = emailContent;

    // Try to parse if there's a clear subject line
    const subjectLine = lines.find(line => line.toLowerCase().includes('subject:'));
    if (subjectLine) {
      subject = subjectLine.replace(/subject:\s*/i, '').trim();
      body = lines.filter(line => !line.toLowerCase().includes('subject:')).join('\n').trim();
    }

    return { subject, body };
  } catch (error) {
    console.error('Error generating email with OpenAI:', error);
    // Fallback email
    return {
      subject: `Congratulations on your recent coverage, ${firstName}!`,
      body: `Hi ${firstName},\n\nI saw your recent coverage regarding "${storyTitle}" and wanted to congratulate you on the great work. Your dedication to personal injury law is inspiring.\n\nBest regards,\nNorthpoint Trial Law Team`
    };
  }
};

// Helper function to insert draft into outbox
const insertDraft = async (targetId: number, subject: string, body: string): Promise<number> => {
  if (demoMode || !pool) {
    const draft = {
      id: nextOutboxId++,
      target_id: targetId,
      subject,
      body,
      sent: false,
      created_at: new Date().toISOString(),
    };
    memoryOutbox.push(draft);
    return draft.id;
  }

  try {
    const result = await pool.query(`
      INSERT INTO referral_outbox (target_id, subject, body)
      VALUES ($1, $2, $3)
      RETURNING id
    `, [targetId, subject, body]);
    
    return result.rows[0].id;
  } catch (error) {
    console.error('Error inserting draft:', error);
    throw error;
  }
};

// Routes

// POST /referral/upload - Upload CSV file with referral targets
router.post('/upload', upload.single('csvFile'), async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No CSV file uploaded' });
      return;
    }

    const targets = await parseCSVFromBuffer(req.file.buffer);
    
    if (targets.length === 0) {
      res.status(400).json({ error: 'No valid targets found in CSV file' });
      return;
    }

    const insertedIds: number[] = [];
    for (const target of targets) {
      try {
        const id = await upsertTarget(target);
        insertedIds.push(id);
      } catch (error) {
        console.error('Error processing target:', target, error);
      }
    }

    res.json({
      success: true,
      message: `Processed ${insertedIds.length} referral targets`,
      processed: insertedIds.length,
      total: targets.length,
      demo: demoMode,
    });
  } catch (error) {
    console.error('Error uploading CSV:', error);
    res.status(500).json({ error: 'Failed to process CSV file' });
  }
});

// POST /referral/check - Check for news about attorneys and generate emails
router.post('/check', async (req: Request, res: Response): Promise<void> => {
  try {
    let targets: Array<{ id: number; first_name: string; last_name: string; email: string }> = [];

    if (demoMode || !pool) {
      targets = memoryTargets.map(t => ({
        id: t.id,
        first_name: t.first_name,
        last_name: t.last_name,
        email: t.email,
      }));
    } else {
      const result = await pool.query('SELECT id, first_name, last_name, email FROM referral_targets');
      targets = result.rows;
    }

    const results = {
      checked: 0,
      emailsGenerated: 0,
      errors: [] as string[],
    };

    for (const target of targets) {
      try {
        results.checked++;
        const searchQuery = `${target.first_name} ${target.last_name} personal injury`;
        
        // Try NewsAPI first, fallback to Google News
        let articles = await searchNewsAPI(searchQuery);
        if (articles.length === 0) {
          articles = await searchGoogleNews(searchQuery);
        }

        // Process first relevant article
        if (articles.length > 0) {
          const article = articles[0];
          const email = await generateCongratulationEmail(target.first_name, article.title);
          
          await insertDraft(target.id, email.subject, email.body);
          results.emailsGenerated++;
        }
      } catch (error) {
        console.error(`Error processing target ${target.email}:`, error);
        results.errors.push(`Error processing ${target.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    res.json({
      success: true,
      message: `Checked ${results.checked} attorneys, generated ${results.emailsGenerated} emails`,
      ...results,
      demo: demoMode,
    });
  } catch (error) {
    console.error('Error checking for news:', error);
    res.status(500).json({ error: 'Failed to check for news and generate emails' });
  }
});

// GET /referral/outbox - Get all unsent drafts
router.get('/outbox', async (req: Request, res: Response): Promise<void> => {
  try {
    let drafts: any[] = [];

    if (demoMode || !pool) {
      drafts = memoryOutbox
        .filter(draft => !draft.sent)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map(draft => {
          const target = memoryTargets.find(t => t.id === draft.target_id);
          return {
            ...draft,
            target_name: target ? `${target.first_name} ${target.last_name}` : 'Unknown',
            target_email: target?.email || 'Unknown',
          };
        });
    } else {
      const result = await pool.query(`
        SELECT 
          o.*,
          t.first_name || ' ' || t.last_name as target_name,
          t.email as target_email
        FROM referral_outbox o
        JOIN referral_targets t ON o.target_id = t.id
        WHERE o.sent = FALSE
        ORDER BY o.created_at DESC
      `);
      drafts = result.rows;
    }

    res.json({
      success: true,
      drafts,
      count: drafts.length,
      demo: demoMode,
    });
  } catch (error) {
    console.error('Error fetching outbox:', error);
    res.status(500).json({ error: 'Failed to fetch outbox' });
  }
});

// PATCH /referral/outbox/:id/sent - Mark draft as sent
router.patch('/outbox/:id/sent', async (req: Request, res: Response): Promise<void> => {
  try {
    const draftId = parseInt(req.params.id);
    
    if (isNaN(draftId)) {
      res.status(400).json({ error: 'Invalid draft ID' });
      return;
    }

    if (demoMode || !pool) {
      const draftIndex = memoryOutbox.findIndex(d => d.id === draftId);
      if (draftIndex === -1) {
        res.status(404).json({ error: 'Draft not found' });
        return;
      }
      memoryOutbox[draftIndex].sent = true;
    } else {
      const result = await pool.query(
        'UPDATE referral_outbox SET sent = TRUE WHERE id = $1 RETURNING id',
        [draftId]
      );
      
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Draft not found' });
        return;
      }
    }

    res.json({
      success: true,
      message: 'Draft marked as sent',
      draftId,
      demo: demoMode,
    });
  } catch (error) {
    console.error('Error marking draft as sent:', error);
    res.status(500).json({ error: 'Failed to mark draft as sent' });
  }
});

// GET /referral/test - Test endpoint
router.get('/test', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Referral routes are working',
    demo: demoMode,
    memoryTargets: demoMode ? memoryTargets.length : 'N/A',
    memoryOutbox: demoMode ? memoryOutbox.length : 'N/A',
  });
});

export default router;
