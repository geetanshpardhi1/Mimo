// supabase/functions/search-memories/index.ts

// @ts-expect-error Deno URL imports
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SearchRequest {
  query: string;
  limit?: number;
}

/**
 * Parse temporal references from natural language query
 */
async function parseTemporalQuery(query: string): Promise<{
  has_temporal: boolean;
  date_range?: { start: string; end: string };
  semantic_query: string;
}> {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const systemPrompt = `You are a date parser. Extract date ranges from natural language.
Current date: ${todayStr} (${today.toLocaleDateString("en-US", { weekday: "long" })})

IMPORTANT RULES:
- "last Monday" means the most recent Monday BEFORE today (not this coming Monday)
- "yesterday" means exactly 1 day ago
- "last week" means 7 days ago to yesterday
- "last month" means the entire previous calendar month
- Always calculate dates accurately from the current date

Examples:
Input: "last Monday" (today is Friday, Feb 7, 2026)
Output: {"has_temporal": true, "date_range": {"start": "2026-02-03", "end": "2026-02-03"}, "semantic_query": ""}

Input: "last Monday gym" (today is Friday, Feb 7, 2026)  
Output: {"has_temporal": true, "date_range": {"start": "2026-02-03", "end": "2026-02-03"}, "semantic_query": "gym workout exercise"}

Input: "conversation with Sarah"
Output: {"has_temporal": false, "date_range": null, "semantic_query": "conversation with Sarah"}

Return JSON with:
{
  "has_temporal": boolean,
  "date_range": {"start": "YYYY-MM-DD", "end": "YYYY-MM-DD"} or null,
  "semantic_query": "the non-temporal parts of the query"
}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Current date: ${todayStr}. Parse this query: "${query}"` },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error("Temporal parsing failed");
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    console.log("📅 Temporal analysis:", result);
    return result;
  } catch (error) {
    console.error("⚠️ Temporal parsing failed:", error);
    return {
      has_temporal: false,
      semantic_query: query,
    };
  }
}

/**
 * Generate embedding for search query
 */
async function generateQueryEmbedding(query: string): Promise<number[]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: query,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate query embedding");
  }

  const data = await response.json();
  return data.data[0].embedding;
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

/**
 * Hybrid search: temporal filter + semantic search
 */
async function hybridSearch(
  supabase: any,
  queryEmbedding: number[],
  dateRange?: { start: string; end: string },
  limit: number = 20
) {
  console.log("🔍 Building search query...");

  // Start with base query
  let query = supabase
    .from("memories")
    .select("id, raw_text, summary, context, mood, created_at, embedding");

  // Apply temporal filter if present
  if (dateRange) {
    console.log(`📅 Filtering by date range: ${dateRange.start} to ${dateRange.end}`);
    
    // Add 1 day buffer on each side for flexibility
    const startDate = new Date(dateRange.start);
    startDate.setDate(startDate.getDate() - 1);
    
    const endDate = new Date(dateRange.end);
    endDate.setDate(endDate.getDate() + 1);
    
    query = query
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());
  } else {
    // If no temporal filter, limit to recent memories for performance
    query = query.order("created_at", { ascending: false }).limit(500);
  }

  const { data: memories, error } = await query;

  if (error) {
    console.error("❌ Database error:", error);
    throw new Error(`Database query failed: ${error.message}`);
  }

  if (!memories || memories.length === 0) {
    console.log("📭 No memories found in date range");
    return [];
  }

  console.log(`📦 Found ${memories.length} memories, calculating similarities...`);

  // Calculate similarity for each memory
  const results = memories
    .map((memory: any) => {
      // Skip if no embedding
      if (!memory.embedding) {
        console.log(`⚠️ Memory ${memory.id} has no embedding, skipping`);
        return null;
      }

      // Calculate cosine similarity
      const similarity = cosineSimilarity(queryEmbedding, memory.embedding);

      return {
        id: memory.id,
        raw_text: memory.raw_text,
        summary: memory.summary,
        context: memory.context,
        mood: memory.mood,
        created_at: memory.created_at,
        similarity,
        match_type: dateRange ? "temporal_semantic" : "semantic_only",
      };
    })
    .filter((r: any) => r !== null && r.similarity > 0.3) // Lower threshold for more results
    .sort((a: any, b: any) => b.similarity - a.similarity)
    .slice(0, limit);

  console.log(`✅ Returning ${results.length} results`);
  
  // Log top 3 matches for debugging
  results.slice(0, 3).forEach((r: any, i: number) => {
    console.log(`  ${i + 1}. Score: ${r.similarity.toFixed(3)} - "${r.raw_text.substring(0, 50)}..."`);
  });

  return results;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Validate auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Parse request
    const { query, limit = 20 }: SearchRequest = await req.json();

    if (!query?.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: "Query is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`\n${"=".repeat(70)}`);
    console.log(`🔍 SEARCH REQUEST: "${query}"`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`${"=".repeat(70)}`);

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    // STEP 1: Parse temporal references
    console.log("📅 Step 1: Parsing temporal references...");
    const queryAnalysis = await parseTemporalQuery(query);
    console.log(`  Has temporal: ${queryAnalysis.has_temporal}`);
    if (queryAnalysis.date_range) {
      console.log(`  Date range: ${queryAnalysis.date_range.start} to ${queryAnalysis.date_range.end}`);
    }
    console.log(`  Semantic query: "${queryAnalysis.semantic_query}"`);

    // STEP 2: Generate embedding for the query
    console.log("🧮 Step 2: Generating query embedding...");
    const searchText = queryAnalysis.semantic_query || query;
    const queryEmbedding = await generateQueryEmbedding(searchText);
    console.log(`  ✅ Generated ${queryEmbedding.length}-dimensional embedding`);

    // STEP 3: Perform hybrid search
    console.log("🔍 Step 3: Searching memories...");
    const results = await hybridSearch(
      supabase,
      queryEmbedding,
      queryAnalysis.date_range,
      limit
    );

    const processingTime = Date.now() - startTime;
    console.log(`✅ Search complete in ${processingTime}ms`);
    console.log(`${"=".repeat(70)}\n`);

    return new Response(
      JSON.stringify({
        success: true,
        query: {
          original: query,
          semantic: queryAnalysis.semantic_query,
          has_temporal: queryAnalysis.has_temporal,
          date_range: queryAnalysis.date_range,
        },
        results,
        count: results.length,
        processing_time_ms: processingTime,
      }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`💥 Search error after ${processingTime}ms:`, error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        processing_time_ms: processingTime,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});