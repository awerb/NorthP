-- Migration script to create referral system, AI ranking, and keyword tracking tables
-- Run with: psql $DATABASE_URL -f scripts/initReferral.sql

-- attorney master list
CREATE TABLE IF NOT EXISTS referral_targets (
  id          SERIAL PRIMARY KEY,
  first_name  TEXT,
  last_name   TEXT,
  email       TEXT UNIQUE,
  firm        TEXT,
  city        TEXT
);

-- drafted emails awaiting send
CREATE TABLE IF NOT EXISTS referral_outbox (
  id          SERIAL PRIMARY KEY,
  target_id   INTEGER REFERENCES referral_targets(id),
  subject     TEXT,
  body        TEXT,
  sent        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- AI ranking scores tracking
CREATE TABLE IF NOT EXISTS ai_rank_scores (
  id          SERIAL PRIMARY KEY,
  model       TEXT NOT NULL,
  score       INTEGER NOT NULL,
  rank        INTEGER,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Keyword tracking snapshots
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_referral_targets_email ON referral_targets(email);
CREATE INDEX IF NOT EXISTS idx_referral_outbox_target_id ON referral_outbox(target_id);
CREATE INDEX IF NOT EXISTS idx_referral_outbox_sent ON referral_outbox(sent);
CREATE INDEX IF NOT EXISTS idx_referral_outbox_created_at ON referral_outbox(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_rank_scores_model ON ai_rank_scores(model);
CREATE INDEX IF NOT EXISTS idx_ai_rank_scores_created_at ON ai_rank_scores(created_at);
CREATE INDEX IF NOT EXISTS idx_keyword_snapshots_keyword ON keyword_snapshots(keyword);
CREATE INDEX IF NOT EXISTS idx_keyword_snapshots_date ON keyword_snapshots(date);
CREATE INDEX IF NOT EXISTS idx_keyword_snapshots_keyword_date ON keyword_snapshots(keyword, date);

-- Display success message
\echo 'Referral system, AI ranking, and keyword tracking tables created successfully!'
