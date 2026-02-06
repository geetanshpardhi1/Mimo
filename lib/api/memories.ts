// lib/api/memories.ts

import { useSupabase } from "@/lib/supabase";
import { useAuth } from "@clerk/clerk-expo";

/**
 * Memory data structure matching the database schema
 */
export type Memory = {
  id: string;
  user_id: string;
  raw_text: string;
  summary?: string | null;
  context?: string | null;
  mood?: string | null;
  created_at: string;
  embedding?: number[] | null;
};

/**
 * Input type for creating a new memory
 */
export type CreateMemoryInput = {
  raw_text: string;
  context?: string;
  mood?: string;
};

/**
 * Search result type with similarity score
 */
export type SearchResult = {
  id: string;
  raw_text: string;
  summary: string | null;
  context?: string | null;
  mood?: string | null;
  created_at: string;
  similarity: number;
  match_type: "temporal_semantic" | "semantic_only";
};

/**
 * Search response type
 */
export type SearchResponse = {
  success: boolean;
  query: {
    original: string;
    semantic: string;
    has_temporal: boolean;
    date_range?: { start: string; end: string };
  };
  results: SearchResult[];
  count: number;
};

/**
 * Custom hook providing memory API operations
 * All operations are user-scoped and authenticated via Clerk
 */
export function useMemoryApi() {
  const supabase = useSupabase();
  const { userId, getToken } = useAuth();

  return {
    /**
     * Create a new memory for the authenticated user
     */
    async create(input: CreateMemoryInput): Promise<Memory> {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("memories")
        .insert({
          user_id: userId,
          raw_text: input.raw_text,
          context: input.context,
          mood: input.mood,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Memory;
    },

    /**
     * Process a memory with AI to generate summary and embeddings
     * This calls the Edge Function to generate AI content asynchronously
     */
    async processWithAI(memoryId: string, rawText: string): Promise<void> {
      try {
        console.log(`🧠 Triggering AI processing for memory: ${memoryId}`);
        const token = await getToken();

        if (!token) {
          console.error("❌ No auth token available for AI processing");
          return;
        }

        const { data, error } = await supabase.functions.invoke("process-memory", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: {
            memory_id: memoryId,
            raw_text: rawText,
          },
        });

        if (error) {
          console.error("❌ Edge Function Error:", error);
          if (error instanceof Error) console.error("Message:", error.message);
        } else {
          console.log("✅ AI Processing initiated successfully", data);
        }
      } catch (e) {
        console.error("❌ Exception calling Edge Function:", e);
      }
    },

    /**
     * Search memories using natural language queries
     * Supports both semantic search and temporal queries like "last Monday"
     */
    async search(query: string, limit: number = 20): Promise<SearchResponse> {
      try {
        console.log(`🔍 Searching memories for: "${query}"`);
        const token = await getToken();

        if (!token) {
          throw new Error("User not authenticated");
        }

        const { data, error } = await supabase.functions.invoke("search-memories", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: {
            query,
            limit,
          },
        });

        if (error) {
          console.error("❌ Search Error:", error);
          throw error;
        }

        console.log(`✅ Search complete: ${data.count} results`);
        return data as SearchResponse;
      } catch (e) {
        console.error("❌ Exception during search:", e);
        throw e;
      }
    },

    /**
     * Get all memories for the authenticated user, ordered by most recent
     */
    async getAll(): Promise<Memory[]> {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Memory[];
    },

    /**
     * Get a single memory by ID
     */
    async getById(id: string): Promise<Memory> {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Memory;
    },

    /**
     * Delete a memory by ID
     */
    async delete(id: string): Promise<void> {
      const { error } = await supabase.from("memories").delete().eq("id", id);

      if (error) throw error;
    },

    /**
     * Update a memory
     */
    async update(id: string, input: Partial<CreateMemoryInput>): Promise<Memory> {
      const { data, error } = await supabase
        .from("memories")
        .update({
          raw_text: input.raw_text,
          context: input.context,
          mood: input.mood,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Memory;
    },
  };
}