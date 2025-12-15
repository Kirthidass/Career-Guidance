-- AI Career Compass - Supabase Tables Setup
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Resumes table (analysis results with history)
CREATE TABLE IF NOT EXISTS resumes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    target_role TEXT NOT NULL,
    analysis_json JSONB NOT NULL,
    resume_content TEXT,
    ats_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roadmaps table (learning paths with progress)
CREATE TABLE IF NOT EXISTS roadmaps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    roadmap_json JSONB NOT NULL,
    progress INTEGER DEFAULT 0,
    completed_weeks JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DISABLE RLS for backend access (using anon key)
-- This allows the backend to insert/read without auth.uid() restrictions
ALTER TABLE resumes DISABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);

-- If you already have the tables with RLS enabled, run these commands to disable:
-- ALTER TABLE resumes DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE roadmaps DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;

-- Add progress columns if they don't exist
ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS completed_weeks JSONB DEFAULT '[]';
ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
