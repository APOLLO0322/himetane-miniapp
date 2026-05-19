import { createClient } from "@supabase/supabase-js";
import crossFetch from "cross-fetch";
import type { Database } from "./types";

// .env.local の URL は /rest/v1/ 付きで入っている場合があるので除去
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    // Node.js 22 の built-in fetch と ReadableStream の非互換を回避
    fetch: crossFetch,
  },
});
