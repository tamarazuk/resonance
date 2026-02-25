-- Enable required extensions for Resonance database
-- These extensions are required for:
-- - pgvector: Vector embeddings for semantic search
-- - pgcrypto: UUID generation for primary keys

-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Verify extensions are installed
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
        RAISE EXCEPTION 'pgvector extension is not installed';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
        RAISE EXCEPTION 'pgcrypto extension is not installed';
    END IF;

    RAISE NOTICE 'Database extensions installed successfully';
END
$$;
