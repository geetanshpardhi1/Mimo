// @ts-expect-error Deno URL imports are resolved by the Edge runtime, not TS.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

interface RequestBody {
  memory_id: string;
  raw_text: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        ...corsHeaders,
      },
    });
  }

  try {
    // 1. Require an Authorization header so RLS can be enforced downstream
    const authHeader = req.headers.get("Authorization") ?? req.headers.get("authorization");
    if (!authHeader) {
      console.error("Missing Authorization header");
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: Missing Authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Parse request body
    const { memory_id, raw_text }: RequestBody = await req.json();

    if (!memory_id || !raw_text) {
      throw new Error("memory_id and raw_text are required");
    }

    // 2. Fetch Memory using user-scoped client (RLS enforced)
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: authHeader },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const { data: memory, error: fetchError } = await supabase
      .from("memories")
      .select("id")
      .eq("id", memory_id)
      .single();

    if (fetchError || !memory) {
      console.error("Memory fetch error:", fetchError);
      return new Response(
        JSON.stringify({ success: false, error: "Memory not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`✅ RLS verified. Processing memory ${memory_id}`);

    // Step 4: Generate AI summary using GPT-4o-mini
    const summaryResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that creates concise, meaningful summaries of personal memories. Keep summaries to 1-2 sentences max. Preserve the emotional tone and key details.",
          },
          {
            role: "user",
            content: `Summarize this memory:\n\n${raw_text}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    if (!summaryResponse.ok) {
      const error = await summaryResponse.text();
      throw new Error(`OpenAI summary failed: ${error}`);
    }

    const summaryData = await summaryResponse.json();
    const summary = summaryData.choices[0].message.content.trim();

    console.log(`Generated summary: ${summary}`);

    // Step 5: Generate embeddings using text-embedding-3-small
    const embeddingResponse = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: raw_text,
      }),
    });

    if (!embeddingResponse.ok) {
      const error = await embeddingResponse.text();
      throw new Error(`OpenAI embedding failed: ${error}`);
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;

    console.log(`Generated embedding with ${embedding.length} dimensions`);

    // Step 6: Update the memory in Supabase (RLS enforced)
    const { error: updateError } = await supabase
      .from("memories")
      .update({
        summary,
        embedding,
      })
      .eq("id", memory_id);

    if (updateError) {
      throw new Error(`Supabase update failed: ${updateError.message}`);
    }

    console.log(`Successfully updated memory ${memory_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        memory_id,
        summary,
        embedding_dimensions: embedding.length,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Error processing memory:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});
