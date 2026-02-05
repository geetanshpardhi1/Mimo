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
 * Custom hook providing memory API operations
 * All operations are user-scoped and authenticated via Clerk
 */
export function useMemoryApi() {
  const supabase = useSupabase();
  const { userId } = useAuth();

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
  };
}
