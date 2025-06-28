import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import OpenAI from 'openai';

const router = Router();

// Initialize PostgreSQL connection (shared from other modules)
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
    console.warn('PostgreSQL connection failed for AI ranking, enabling demo mode:', error.message);
    pool = null;
    demoMode = true;
  });
} catch (error) {
  console.warn('PostgreSQL not configured for AI ranking, running in demo mode');
  pool = null;
  demoMode = true;
}

// Initialize OpenAI client
let openai: OpenAI | null = null;
const getOpenAI = () => {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
};

// Initialize database table
const initDatabase = async () => {
  if (!pool || demoMode) {
    console.log('Running AI ranking in demo mode without database');
    return;
  }
  
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_rank_scores (
        id SERIAL PRIMARY KEY,
        model TEXT NOT NULL,
        score INTEGER NOT NULL,
        rank INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    
    // Create index for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_ai_rank_scores_model ON ai_rank_scores(model);
      CREATE INDEX IF NOT EXISTS idx_ai_rank_scores_created_at ON ai_rank_scores(created_at);
    `);
    
    console.log('AI ranking database initialized');
  } catch (error) {
    console.error('Error initializing AI ranking database:', error);
  }
};

// Initialize on startup
initDatabase();

// In-memory storage for demo mode
let memoryResults: Array<{
  id: number;
  model: string;
  score: number;
  rank: number | null;
  created_at: string;
}> = [];
let nextId = 1;

// Interface for AI ranking results
interface AIRankResult {
  model: string;
  score: number;
  rank: number | null;
}

interface AIRankResponse {
  results: AIRankResult[];
  timestamp: string;
}

// Helper function to parse lawyer names from AI response
const parseTopLawyers = (response: string): string[] => {
  // Clean the response and extract names
  const lines = response.split('\n');
  const lawyers: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Look for numbered lists, bullet points, or lawyer names
    const patterns = [
      /^\d+\.\s*(.+)$/,        // "1. John Doe"
      /^-\s*(.+)$/,            // "- John Doe"
      /^\*\s*(.+)$/,           // "* John Doe"
      /^(.+)\s*-\s*.+$/,       // "John Doe - Law Firm"
    ];
    
    for (const pattern of patterns) {
      const match = trimmed.match(pattern);
      if (match) {
        let name = match[1].trim();
        
        // Clean up the name - remove law firm suffixes
        name = name.replace(/\s*-\s*.+$/, ''); // Remove everything after " - "
        name = name.replace(/\s*\(.+\)$/, ''); // Remove parentheses
        name = name.replace(/\s*,\s*.+$/, ''); // Remove everything after comma
        
        if (name && lawyers.length < 5) {
          lawyers.push(name);
        }
        break;
      }
    }
    
    // If we have 5 lawyers, stop
    if (lawyers.length >= 5) break;
  }
  
  return lawyers.slice(0, 5);
};

// Helper function to check if Northpoint appears in the list
const checkNorthpointRanking = (lawyers: string[]): { score: number; rank: number | null } => {
  for (let i = 0; i < lawyers.length; i++) {
    const lawyer = lawyers[i].toLowerCase();
    if (lawyer.includes('northpoint')) {
      const rank = i + 1;
      const score = 6 - rank; // rank 1 = 5pts, rank 2 = 4pts, ..., rank 5 = 1pt
      return { score, rank };
    }
  }
  return { score: 0, rank: null };
};

// AI Model API calls
const queryOpenAI = async (prompt: string): Promise<string> => {
  try {
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    });
    
    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error querying OpenAI:', error);
    throw new Error('OpenAI query failed');
  }
};

const queryAnthropic = async (prompt: string): Promise<string> => {
  try {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.content[0]?.text || '';
  } catch (error) {
    console.error('Error querying Anthropic:', error);
    throw new Error('Anthropic query failed');
  }
};

const queryGemini = async (prompt: string): Promise<string> => {
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || '';
  } catch (error) {
    console.error('Error querying Gemini:', error);
    throw new Error('Gemini query failed');
  }
};

const queryCohere = async (prompt: string): Promise<string> => {
  try {
    const cohereKey = process.env.COHERE_API_KEY;
    if (!cohereKey) {
      throw new Error('COHERE_API_KEY not configured');
    }
    
    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cohereKey}`,
      },
      body: JSON.stringify({
        model: 'command',
        prompt: prompt,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Cohere API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.generations[0]?.text || '';
  } catch (error) {
    console.error('Error querying Cohere:', error);
    throw new Error('Cohere query failed');
  }
};

// Store results in database
const storeResult = async (model: string, score: number, rank: number | null): Promise<void> => {
  if (demoMode || !pool) {
    // Store in memory for demo mode
    memoryResults.push({
      id: nextId++,
      model,
      score,
      rank,
      created_at: new Date().toISOString(),
    });
    return;
  }
  
  try {
    await pool.query(
      'INSERT INTO ai_rank_scores (model, score, rank) VALUES ($1, $2, $3)',
      [model, score, rank]
    );
  } catch (error) {
    console.error('Error storing AI rank result:', error);
    throw error;
  }
};

// Main route handler
router.post('/rank', async (req: Request, res: Response): Promise<void> => {
  try {
    const prompt = "Who are the best personal injury lawyers in San Francisco?";
    const timestamp = new Date().toISOString();
    const results: AIRankResult[] = [];
    
    // Define AI models to query
    const models = [
      { name: 'OpenAI', queryFunc: queryOpenAI },
      { name: 'Claude', queryFunc: queryAnthropic },
      { name: 'Gemini', queryFunc: queryGemini },
      { name: 'Cohere', queryFunc: queryCohere },
    ];
    
    // Query each AI model
    for (const model of models) {
      try {
        console.log(`Querying ${model.name}...`);
        const response = await model.queryFunc(prompt);
        const lawyers = parseTopLawyers(response);
        const { score, rank } = checkNorthpointRanking(lawyers);
        
        console.log(`${model.name} - Lawyers found:`, lawyers);
        console.log(`${model.name} - Northpoint score: ${score}, rank: ${rank}`);
        
        // Store result in database
        await storeResult(model.name, score, rank);
        
        results.push({
          model: model.name,
          score,
          rank,
        });
      } catch (error) {
        console.error(`Error with ${model.name}:`, error);
        
        // Store failed result
        await storeResult(model.name, 0, null);
        
        results.push({
          model: model.name,
          score: 0,
          rank: null,
        });
      }
    }
    
    const response: AIRankResponse = {
      results,
      timestamp,
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error in AI ranking:', error);
    res.status(500).json({ 
      error: 'Failed to perform AI ranking',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET route to retrieve historical results
router.get('/history', async (req: Request, res: Response): Promise<void> => {
  try {
    let results;
    
    if (demoMode || !pool) {
      results = memoryResults.slice(-20); // Last 20 results
    } else {
      const queryResult = await pool.query(
        'SELECT * FROM ai_rank_scores ORDER BY created_at DESC LIMIT 20'
      );
      results = queryResult.rows;
    }
    
    res.json({
      success: true,
      results,
      demo: demoMode,
    });
  } catch (error) {
    console.error('Error fetching AI ranking history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch AI ranking history',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test route
router.get('/test', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'AI ranking routes are working',
    demo: demoMode,
    memoryResults: demoMode ? memoryResults.length : 'N/A',
  });
});

export default router;
