import { createClient } from "@supabase/supabase-js";

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

/** Anon client for auth operations (signUp, signIn, getUser from JWT). */
export function createAnonClient() {
  return createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_ANON_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Client scoped to the user's JWT so RLS applies. */
export function createUserClient(accessToken) {
  return createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_ANON_KEY"), {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isSupabaseConfigured() {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
}
