"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pg_1 = require("pg");
const router = (0, express_1.Router)();
// Initialize PostgreSQL connection
let pool = null;
let demoMode = false;
try {
    pool = new pg_1.Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'northpoint',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
    });
    // Test the connection
    pool.connect().catch((error) => {
        console.warn('PostgreSQL connection failed, enabling demo mode:', error.message);
        pool = null;
        demoMode = true;
    });
}
catch (error) {
    console.warn('PostgreSQL not configured, running in demo mode');
    pool = null;
    demoMode = true;
}
// In-memory storage for demo mode
let memoryArticles = [];
// Add some sample data for demo
const addSampleData = () => {
    if (memoryArticles.length === 0) {
        const sampleArticles = [
            {
                id: 1,
                title: "San Francisco Car Accident Leaves Two Injured",
                url: "https://example.com/sf-accident-1",
                tag: "crash",
                summary: "A two-car collision in downtown San Francisco resulted in minor injuries to both drivers.",
                image_url: undefined,
                published_at: new Date().toISOString(),
                source: "Demo News",
                fresh: true,
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                title: "Medical Malpractice Case Settled for $2M in Oakland",
                url: "https://example.com/malpractice-settlement",
                tag: "medical malpractice",
                summary: "A local hospital settles a malpractice case involving surgical complications.",
                image_url: undefined,
                published_at: new Date(Date.now() - 3600000).toISOString(),
                source: "Demo Legal News",
                fresh: true,
                created_at: new Date().toISOString()
            },
            {
                id: 3,
                title: "Construction Site Accident in San Jose Under Investigation",
                url: "https://example.com/construction-accident",
                tag: "construction",
                summary: "Worker injured at construction site due to equipment malfunction.",
                image_url: undefined,
                published_at: new Date(Date.now() - 7200000).toISOString(),
                source: "Demo Safety News",
                fresh: true,
                created_at: new Date().toISOString()
            }
        ];
        memoryArticles.push(...sampleArticles);
    }
};
// Initialize database table
const initDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!pool || demoMode) {
        console.log('Running in demo mode without database');
        addSampleData();
        return;
    }
    try {
        yield pool.query(`
      CREATE TABLE IF NOT EXISTS news_articles (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        url TEXT UNIQUE NOT NULL,
        tag VARCHAR(100),
        summary TEXT,
        image_url TEXT,
        published_at TIMESTAMPTZ NOT NULL,
        source VARCHAR(100) NOT NULL,
        fresh BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
        // Create index for better performance
        yield pool.query(`
      CREATE INDEX IF NOT EXISTS idx_news_published_at ON news_articles(published_at DESC)
    `);
        console.log('News articles table initialized successfully');
    }
    catch (error) {
        console.error('Error initializing database:', error);
        console.log('Falling back to demo mode');
        demoMode = true;
        pool = null;
        addSampleData();
    }
});
// Call init on module load
initDatabase();
// Helper function to categorize articles by keywords
const categorizeArticle = (title, summary = '') => {
    const text = (title + ' ' + summary).toLowerCase();
    if (text.includes('construction') || text.includes('building') || text.includes('contractor')) {
        return 'construction';
    }
    if (text.includes('medical') || text.includes('malpractice') || text.includes('doctor') || text.includes('hospital')) {
        return 'medical malpractice';
    }
    if (text.includes('product') || text.includes('defective') || text.includes('recall')) {
        return 'product liability';
    }
    if (text.includes('workplace') || text.includes('worker') || text.includes('job') || text.includes('employee')) {
        return 'workplace';
    }
    if (text.includes('crash') || text.includes('accident') || text.includes('collision') || text.includes('vehicle')) {
        return 'crash';
    }
    return 'general';
};
// Fetch articles from Event Registry API
const fetchEventRegistry = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const apiKey = process.env.EVENT_REGISTRY_API_KEY;
        if (!apiKey) {
            console.warn('EVENT_REGISTRY_API_KEY not configured');
            return [];
        }
        // Event Registry API endpoint for article search
        const requestBody = {
            action: "getArticles",
            keyword: "accident OR crash OR malpractice",
            conceptUri: "http://en.wikipedia.org/wiki/San_Francisco_Bay_Area",
            lang: "eng",
            articlesCount: 50,
            articlesSortBy: "date",
            articlesIncludeArticleImage: true,
            articlesIncludeArticleCategories: true,
            resultType: "articles",
            apiKey: apiKey
        };
        const response = yield fetch('https://eventregistry.org/api/v1/article/getArticles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        if (!response.ok) {
            console.error(`Event Registry API error: ${response.status} ${response.statusText}`);
            const errorText = yield response.text();
            console.error('Error response:', errorText);
            return [];
        }
        const data = yield response.json();
        console.log('Event Registry response structure:', Object.keys(data));
        const articles = [];
        if ((_a = data.articles) === null || _a === void 0 ? void 0 : _a.results) {
            for (const article of data.articles.results) {
                if (article.url && article.title) {
                    articles.push({
                        title: article.title,
                        url: article.url,
                        summary: article.body || article.summary || '',
                        image_url: article.image || undefined,
                        published_at: article.dateTime || article.date || new Date().toISOString(),
                        source: ((_b = article.source) === null || _b === void 0 ? void 0 : _b.title) || 'Event Registry',
                    });
                }
            }
        }
        else if (data.error) {
            console.error('Event Registry API error:', data.error);
        }
        else {
            console.log('No articles found in response, response keys:', Object.keys(data));
        }
        console.log(`Fetched ${articles.length} articles from Event Registry`);
        return articles;
    }
    catch (error) {
        console.error('Error fetching from Event Registry:', error);
        return [];
    }
});
// Combine and deduplicate articles
const processArticles = (articles) => __awaiter(void 0, void 0, void 0, function* () {
    if (articles.length === 0) {
        return 0;
    }
    // Deduplicate by URL
    const uniqueArticles = articles.reduce((acc, article) => {
        if (!acc.find(existing => existing.url === article.url)) {
            // Add categorization tag
            article.tag = categorizeArticle(article.title, article.summary);
            acc.push(article);
        }
        return acc;
    }, []);
    console.log(`Processing ${uniqueArticles.length} unique articles`);
    if (!pool) {
        // Demo mode: store in memory
        let insertedCount = 0;
        for (const article of uniqueArticles) {
            const existing = memoryArticles.find(a => a.url === article.url);
            if (!existing) {
                memoryArticles.push(Object.assign(Object.assign({}, article), { id: memoryArticles.length + 1, created_at: new Date().toISOString(), fresh: true }));
                insertedCount++;
            }
            else {
                existing.fresh = true;
                existing.tag = article.tag;
                existing.summary = article.summary;
            }
        }
        return insertedCount;
    }
    // Database mode: insert into PostgreSQL
    let insertedCount = 0;
    for (const article of uniqueArticles) {
        try {
            yield pool.query(`INSERT INTO news_articles (title, url, tag, summary, image_url, published_at, source, fresh)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)
         ON CONFLICT (url) DO UPDATE SET
           fresh = true,
           tag = EXCLUDED.tag,
           summary = EXCLUDED.summary`, [
                article.title,
                article.url,
                article.tag,
                article.summary,
                article.image_url,
                article.published_at,
                article.source
            ]);
            insertedCount++;
        }
        catch (error) {
            console.error('Error inserting article:', error);
        }
    }
    return insertedCount;
});
// GET /news/all - Returns latest 200 articles
router.get('/all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!pool) {
            // Demo mode: return from memory
            const sortedArticles = memoryArticles
                .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
                .slice(0, 200);
            return res.json({
                success: true,
                count: sortedArticles.length,
                articles: sortedArticles,
                demo: true
            });
        }
        const result = yield pool.query(`
      SELECT id, title, url, tag, summary, image_url, published_at, source, fresh, created_at
      FROM news_articles
      ORDER BY published_at DESC
      LIMIT 200
    `);
        res.json({
            success: true,
            count: result.rows.length,
            articles: result.rows
        });
    }
    catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch articles',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// POST /news/refresh - Refresh articles from Event Registry API
router.post('/refresh', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Starting news refresh...');
        // Mark all existing articles as not fresh
        if (pool) {
            yield pool.query('UPDATE news_articles SET fresh = false');
        }
        else {
            // Demo mode: mark all memory articles as not fresh
            memoryArticles.forEach(article => article.fresh = false);
        }
        // Fetch from Event Registry API
        const eventRegistryArticles = yield fetchEventRegistry();
        // Process and insert articles
        const insertedCount = yield processArticles(eventRegistryArticles);
        res.json({
            success: true,
            message: `Crawled ${insertedCount} articles`,
            counts: {
                eventRegistry: eventRegistryArticles.length,
                total: eventRegistryArticles.length,
                inserted: insertedCount
            },
            demo: demoMode || !pool
        });
    }
    catch (error) {
        console.error('Error refreshing news:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to refresh news articles'
        });
    }
}));
// GET /news/test - Simple test endpoint
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'News routes are working',
        demo: demoMode || !pool,
        memoryCount: memoryArticles.length
    });
});
// GET /news/stats - Get statistics about articles
router.get('/stats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!pool) {
            // Demo mode: calculate stats from memory
            const total = memoryArticles.length;
            const fresh = memoryArticles.filter(a => a.fresh).length;
            const tagCounts = memoryArticles.reduce((acc, article) => {
                acc[article.tag || 'general'] = (acc[article.tag || 'general'] || 0) + 1;
                return acc;
            }, {});
            const byTag = Object.entries(tagCounts)
                .map(([tag, count]) => ({ tag, count }))
                .sort((a, b) => b.count - a.count);
            return res.json({
                success: true,
                stats: {
                    total,
                    fresh,
                    byTag
                },
                demo: true
            });
        }
        const totalResult = yield pool.query('SELECT COUNT(*) as total FROM news_articles');
        const freshResult = yield pool.query('SELECT COUNT(*) as fresh FROM news_articles WHERE fresh = true');
        const tagResult = yield pool.query(`
      SELECT tag, COUNT(*) as count 
      FROM news_articles 
      GROUP BY tag 
      ORDER BY count DESC
    `);
        res.json({
            success: true,
            stats: {
                total: parseInt(totalResult.rows[0].total),
                fresh: parseInt(freshResult.rows[0].fresh),
                byTag: tagResult.rows
            }
        });
    }
    catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
}));
exports.default = router;
