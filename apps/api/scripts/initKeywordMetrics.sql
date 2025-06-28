-- SQL script to create keyword_metrics table for storing GSC data
-- Run this script in your PostgreSQL database

CREATE TABLE IF NOT EXISTS keyword_metrics (
    id SERIAL PRIMARY KEY,
    keyword TEXT NOT NULL,
    average_position FLOAT,
    ctr FLOAT,
    impressions INTEGER,
    clicks INTEGER,
    snapshot_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Add index for efficient queries
    UNIQUE(keyword, snapshot_time)
);

-- Create index for faster keyword lookups
CREATE INDEX IF NOT EXISTS idx_keyword_metrics_keyword ON keyword_metrics(keyword);
CREATE INDEX IF NOT EXISTS idx_keyword_metrics_time ON keyword_metrics(snapshot_time);

-- Sample seed queries for personal injury law firm
INSERT INTO keyword_metrics (keyword, average_position, ctr, impressions, clicks) VALUES 
('personal injury lawyer sf', 0.0, 0.0, 0, 0),
('san francisco personal injury attorney', 0.0, 0.0, 0, 0),
('car accident lawyer san francisco', 0.0, 0.0, 0, 0),
('slip and fall attorney sf', 0.0, 0.0, 0, 0),
('workers compensation lawyer san francisco', 0.0, 0.0, 0, 0)
ON CONFLICT (keyword, snapshot_time) DO NOTHING;
