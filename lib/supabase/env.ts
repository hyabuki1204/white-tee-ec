export type DataSource = "mock" | "supabase";

export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function getSupabaseAnonKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function getSupabaseServiceRoleKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

/** True when both public Supabase env vars are set. */
export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

/** Determines whether repositories should read from Supabase or mock data. */
export function getDataSource(): DataSource {
  const explicit = process.env.DATA_SOURCE;

  if (explicit === "supabase") {
    return isSupabaseConfigured() ? "supabase" : "mock";
  }

  if (explicit === "mock") {
    return "mock";
  }

  return isSupabaseConfigured() ? "supabase" : "mock";
}
