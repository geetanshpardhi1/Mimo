-- MIMO Backend Phase 1: Database Schema
-- This script creates the memories table without vector embeddings
-- Run this in Supabase SQL Editor

-- Create the memories table
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  raw_text TEXT NOT NULL,
  summary TEXT,
  context TEXT,
  mood TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE memories IS 'Stores user memories with optional context and mood metadata';
COMMENT ON COLUMN memories.user_id IS 'Clerk user ID from JWT sub claim';
COMMENT ON COLUMN memories.raw_text IS 'Original memory text entered by user';
COMMENT ON COLUMN memories.summary IS 'AI-generated summary (added in Phase 3)';
COMMENT ON COLUMN memories.context IS 'Optional location/context where memory was created';
COMMENT ON COLUMN memories.mood IS 'Optional mood/feeling associated with memory';
