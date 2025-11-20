import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ensureServerSide } from "@/lib/security/server";

// Ensure that this file is only imported on the server.
ensureServerSide();

// The Supabase client.
let supabaseClient: SupabaseClient | null = null;

/** Get the Supabase client, creating it if it doesn't exist. */
export function getOrCreateSupabaseClient(): SupabaseClient {
  if (supabaseClient) return supabaseClient;
  supabaseClient = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!
  );
  return supabaseClient;
}
