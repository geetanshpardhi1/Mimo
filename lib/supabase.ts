import { useAuth } from "@clerk/clerk-expo";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useMemo } from "react";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Custom hook to get a Supabase client authenticated with Clerk
 * 
 * This uses the official Supabase-Clerk integration pattern.
 * According to Supabase docs: https://supabase.com/docs/guides/auth/third-party/clerk
 * 
 * The Clerk session token must include a 'role' claim set to 'authenticated'
 * for RLS policies to work correctly.
 */
export function useSupabase(): SupabaseClient {
  const { getToken } = useAuth();

  const supabase = useMemo(() => {
    return createClient(supabaseUrl, supabaseAnonKey, {
      // Use accessToken pattern for third-party JWTs
      accessToken: async () => {
        const clerkToken = await getToken();
        return clerkToken ?? null;
      },
      auth: {
        // Disable Supabase Auth since we're using Clerk
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }, [getToken]);

  return supabase;
}
