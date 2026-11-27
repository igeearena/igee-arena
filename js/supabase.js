
"use strict";

const SUPABASE_URL =
  "https://ebyjwvyfopfbcsabxqaa.supabase.co";

const SUPABASE_ANON_KEY =
  "PASTE_YOUR_PUBLISHABLE_KEY_HERE";

if (!window.supabase) {
  throw new Error("Supabase JavaScript library is not loaded.");
}

window.igeeSupabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

console.log("IGEE ARENA Supabase connection initialized.");
