import { createClient } from "@supabase/supabase-js";

export function createClientSupabase(url: string, key: string) {
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
