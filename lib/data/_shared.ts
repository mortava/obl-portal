// Shared helpers for the data-access layer.
//
// Each lib/data/* module exposes typed read functions that:
//   1. Get a Supabase server client (cookie-bound, RLS-enforced)
//   2. Query the obl_* tables
//   3. Map DB rows → camelCase UI shapes from lib/platform-types.ts
//
// When the env flag OBL_USE_SAMPLE_DATA=true OR when a query returns 0 rows
// AND the table is one we know should be seeded, we fall back to the
// in-memory sample arrays so the UI is never blank during dev.

import { createClient as createServerClient } from "@/lib/supabase/server";

export async function db() {
  return createServerClient();
}

export const useDevFallback = (): boolean =>
  process.env.OBL_USE_SAMPLE_DATA === "true";
