
"use strict";

const SUPABASE_URL =
  "https://ebyjwvyfopfbcsabxqaa.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_43HR_Dh-35Vpum8CTa6XHg_MIsG47vw";

if (!window.supabase) {
  throw new Error("Supabase JavaScript library is not loaded.");
}

window.igeeSupabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

console.log("IGEE ARENA Supabase connection initialized.");
