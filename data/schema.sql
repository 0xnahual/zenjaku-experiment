-- Create a table to store individual sales events
-- This allows us to calculate volume over any timeframe (daily, monthly, all-time)
CREATE TABLE IF NOT EXISTS sales (
    signature TEXT PRIMARY KEY,
    collection_symbol TEXT NOT NULL,
    buyer TEXT,
    seller TEXT,
    price NUMERIC,
    block_time TIMESTAMPTZ,
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access" 
ON sales FOR SELECT 
USING (true);

-- Service role write access (implicit, but good to document)
-- Only the backend sync script will write to this table.

-- Indexes for faster aggregation
CREATE INDEX IF NOT EXISTS idx_sales_buyer ON sales(buyer);
CREATE INDEX IF NOT EXISTS idx_sales_block_time ON sales(block_time);
CREATE INDEX IF NOT EXISTS idx_sales_collection ON sales(collection_symbol);
