import "react-native-url-polyfill/auto";

import { createClient } from "@supabase/supabase-js";

import { env } from "@/src/config/env";
import { supabaseSessionStorage } from "@/src/data/storage/mmkv";

export const supabase = createClient(
  env.supabaseUrl || "https://example.supabase.co",
  env.supabaseAnonKey || "missing-anon-key",
  {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: false,
    persistSession: true,
    storage: supabaseSessionStorage,
  },
  }
);
