-- NorthPoint Legal Tech App - Complete Database Schema
-- Run with: psql $DATABASE_URL < schema.sql

-- ============================================================================
-- REFERRAL MANAGEMENT SYSTEM
-- ============================================================================

-- Attorney master list for referral targets
CREATE TABLE IF NOT EXISTS referral_targets (
  id          SERIAL PRIMARY KEY,
  first_name  TEXT,
  last_name   TEXT,
  email       TEXT UNIQUE,
  firm        TEXT,
  city        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Drafted emails awaiting send
CREATE TABLE IF NOT EXISTS referral_outbox (
  id          SERIAL PRIMARY KEY,
  target_id   INTEGER REFERENCES referral_targets(id),
  subject     TEXT,
  body        TEXT,
  sent        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  sent_at     TIMESTAMPTZ
);

-- ============================================================================
-- AI RANKING SYSTEM
-- ============================================================================

-- AI ranking scores tracking across different models
CREATE TABLE IF NOT EXISTS ai_rank_scores (
  id          SERIAL PRIMARY KEY,
  model       TEXT NOT NULL,
  url         TEXT NOT NULL,
  keywords    TEXT[] NOT NULL,
  score       INTEGER NOT NULL,
  rank        INTEGER,
  total_found INTEGER DEFAULT 0,
  lawyers_found TEXT[],
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- KEYWORD MONITORING SYSTEM
-- ============================================================================

-- Legacy keyword tracking snapshots (daily aggregates)
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
);

-- New keyword metrics table for real-time GSC data
CREATE TABLE IF NOT EXISTS keyword_metrics (
  id SERIAL PRIMARY KEY,
  keyword TEXT NOT NULL,
  average_position FLOAT,
  ctr FLOAT,
  impressions INTEGER,
  clicks INTEGER,
  snapshot_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(keyword, snapshot_time)
);

-- ============================================================================
-- NEWS MONITORING SYSTEM
-- ============================================================================

-- Track news articles and monitoring queries
CREATE TABLE IF NOT EXISTS news_articles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT UNIQUE,
  source TEXT,
  published_date TIMESTAMPTZ,
  content TEXT,
  relevance_score FLOAT,
  keywords_matched TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved news search queries
CREATE TABLE IF NOT EXISTS news_queries (
  id SERIAL PRIMARY KEY,
  query_text TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  last_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SOCIAL MEDIA CONTENT SYSTEM
-- ============================================================================

-- Generated social media content tracking
CREATE TABLE IF NOT EXISTS social_content (
  id SERIAL PRIMARY KEY,
  platform TEXT NOT NULL,
  topic TEXT,
  content TEXT NOT NULL,
  model_used TEXT,
  prompt_used TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Referral system indexes
CREATE INDEX IF NOT EXISTS idx_referral_targets_email ON referral_targets(email);
CREATE INDEX IF NOT EXISTS idx_referral_outbox_target_id ON referral_outbox(target_id);
CREATE INDEX IF NOT EXISTS idx_referral_outbox_sent ON referral_outbox(sent);
CREATE INDEX IF NOT EXISTS idx_referral_outbox_created_at ON referral_outbox(created_at);

-- AI ranking indexes
CREATE INDEX IF NOT EXISTS idx_ai_rank_scores_model ON ai_rank_scores(model);
CREATE INDEX IF NOT EXISTS idx_ai_rank_scores_url ON ai_rank_scores(url);
CREATE INDEX IF NOT EXISTS idx_ai_rank_scores_created_at ON ai_rank_scores(created_at);

-- Keyword monitoring indexes
CREATE INDEX IF NOT EXISTS idx_keyword_snapshots_keyword ON keyword_snapshots(keyword);
CREATE INDEX IF NOT EXISTS idx_keyword_snapshots_date ON keyword_snapshots(date);
CREATE INDEX IF NOT EXISTS idx_keyword_metrics_keyword ON keyword_metrics(keyword);
CREATE INDEX IF NOT EXISTS idx_keyword_metrics_time ON keyword_metrics(snapshot_time);

-- News system indexes
CREATE INDEX IF NOT EXISTS idx_news_articles_published_date ON news_articles(published_date);
CREATE INDEX IF NOT EXISTS idx_news_articles_relevance_score ON news_articles(relevance_score);
CREATE INDEX IF NOT EXISTS idx_news_articles_created_at ON news_articles(created_at);

-- Social media indexes
CREATE INDEX IF NOT EXISTS idx_social_content_platform ON social_content(platform);
CREATE INDEX IF NOT EXISTS idx_social_content_published ON social_content(published);
CREATE INDEX IF NOT EXISTS idx_social_content_created_at ON social_content(created_at);

-- ============================================================================
-- SEED DATA FOR DEVELOPMENT
-- ============================================================================

-- Insert target keywords for monitoring
INSERT INTO keyword_metrics (keyword, average_position, ctr, impressions, clicks) VALUES 
('personal injury lawyer sf', 0.0, 0.0, 0, 0),
('san francisco personal injury attorney', 0.0, 0.0, 0, 0),
('car accident lawyer san francisco', 0.0, 0.0, 0, 0),
('slip and fall attorney sf', 0.0, 0.0, 0, 0),
('workers compensation lawyer san francisco', 0.0, 0.0, 0, 0),
('medical malpractice lawyer san francisco', 0.0, 0.0, 0, 0),
('product liability attorney sf', 0.0, 0.0, 0, 0),
('wrongful death lawyer san francisco', 0.0, 0.0, 0, 0)
ON CONFLICT (keyword, snapshot_time) DO NOTHING;

-- Insert default news monitoring queries
INSERT INTO news_queries (query_text) VALUES 
('personal injury law'),
('medical malpractice'),
('product liability'),
('wrongful death'),
('workers compensation'),
('san francisco legal news')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DATABASE COMPLETION MESSAGE
-- ============================================================================

-- Add a completion log
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  version TEXT NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO schema_migrations (version) VALUES ('1.0.0_complete_schema');

-- Success message
SELECT 'NorthPoint Legal Tech Database Schema Applied Successfully!' as status;
