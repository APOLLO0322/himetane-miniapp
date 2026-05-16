import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// .env.local の URL は /rest/v1/ 付きで入っている場合があるので除去
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
