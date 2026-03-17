import { createRequire } from "module";
import type { SupabaseClient } from "@supabase/supabase-js";

const require = createRequire(import.meta.url);

let cachedClient: SupabaseClient | null = null;

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
}

function getServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
}

export function hasSupabaseServerAccess() {
  return Boolean(getSupabaseUrl() && getServiceRoleKey());
}

export function getSupabaseServerClient(): SupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  const url = getSupabaseUrl();
  const serviceRoleKey = getServiceRoleKey();

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase server credentials are missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  const { createClient } = require("@supabase/supabase-js") as {
    createClient: (
      supabaseUrl: string,
      serviceRoleKey: string,
      options: Record<string, unknown>,
    ) => SupabaseClient;
  };

  cachedClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedClient;
}
