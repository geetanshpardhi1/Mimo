-- MIMO Backend Phase 3: Add pgvector Extension and Embedding Column
-- This migration adds vector embeddings support for semantic search

-- Step 1: Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 2: Add embedding column to memories table
-- OpenAI's text-embedding-3-small produces 1536-dimension vectors
ALTER TABLE memories
ADD COLUMN embedding vector(1536);

-- Step 3: Create index for vector similarity search
-- Using ivfflat index for efficient similarity search
-- Lists parameter of 100 is good for up to ~1M rows
CREATE INDEX IF NOT EXISTS memories_embedding_idx 
ON memories 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Step 4: Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'memories' 
  AND column_name IN ('embedding', 'summary');

-- Step 5: Show table structure
\d memories;
