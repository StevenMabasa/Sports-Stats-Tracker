// supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

// Expect Vite env variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase credentials!");
  console.error("Please create a .env file in your project root with:");
  console.error("VITE_SUPABASE_URL=your_supabase_project_url");
  console.error("VITE_SUPABASE_ANON_KEY=your_supabase_anon_key");
  console.error("Current values:", { supabaseUrl, supabaseAnonKey });
}

const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export default supabase;
