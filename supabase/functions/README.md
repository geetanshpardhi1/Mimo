# Supabase Edge Functions

This directory contains Edge Functions for the MIMO backend.

## Functions

### `process-memory`

Processes a saved memory by:

1. Generating an AI summary using OpenAI GPT-4o-mini
2. Creating vector embeddings using OpenAI text-embedding-3-small
3. Updating the memory in the database

**Endpoint**: `https://<project-ref>.supabase.co/functions/v1/process-memory`

**Required Secrets**:

- `OPENAI_API_KEY` - Your OpenAI API key
- `SUPABASE_URL` - Auto-injected by Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-injected by Supabase

**Request Body**:

```json
{
  "memory_id": "uuid",
  "raw_text": "The memory text to process"
}
```

**Response**:

```json
{
  "success": true,
  "memory_id": "uuid",
  "summary": "Generated summary",
  "embedding_dimensions": 1536
}
```

## Deployment

Edge Functions are deployed via the Supabase CLI or Dashboard.

### Via Dashboard:

1. Go to **Supabase Dashboard → Edge Functions**
2. Click **"Deploy New Function"**
3. Upload the function code
4. Configure secrets

### Via CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref <your-project-ref>

# Deploy function
supabase functions deploy process-memory
```

## Local Development

To test locally:

```bash
# Serve function locally
supabase functions serve process-memory --env-file ./supabase/.env.local

# Test with curl
curl -X POST http://localhost:54321/functions/v1/process-memory \
  -H "Content-Type: application/json" \
  -d '{"memory_id": "test-id", "raw_text": "Test memory"}'
```
