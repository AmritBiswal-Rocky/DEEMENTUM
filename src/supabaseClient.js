// ─────────────────────────────────────────────
// src/supabaseClient.js
// Centralised Supabase helper
// ─────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';

/* ------------------------------------------------
   1️⃣  Read credentials from .env (preferred)
------------------------------------------------ */
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || // Vite / browser
  process.env.VITE_SUPABASE_URL || // Node tests
  'https://nefnwlphcsmupodvonnu.supabase.co'; // ← fallback (KEEP if you like)

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lZm53bHBoY3NtdXBvZHZvbm51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MzU5NjQsImV4cCI6MjA2NDExMTk2NH0.78RctmECKOEv5H4-mTFLAES1UjVHFcauVSv2uwWnAXs';

/* ------------------------------------------------
   2️⃣  Create a typed Supabase client (v2 style API)
------------------------------------------------ */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/* ------------------------------------------------
   3️⃣  Helpers
------------------------------------------------ */

/**
 * ‼️ Sets the Supabase *auth* session by exchanging
 * a Firebase ID‑token for a Supabase JWT (via your
 * own `/verifyIdToken` endpoint in Flask).
 *
 * @param {string} supabaseAccessToken JWT returned by backend
 */
export async function setSupabaseSession(supabaseAccessToken) {
  const { error } = await supabase.auth.setSession({
    access_token: supabaseAccessToken,
    refresh_token: supabaseAccessToken, // refresh not needed, but API requires it
  });

  if (error) {
    console.error('❌ Unable to set Supabase session:', error.message);
  } else {
    console.log('✅ Supabase session established');
  }
}

/**
 * Sync basic Firebase profile info into Supabase `profiles` table.
 * Call this right after login (only once per user).
 *
 * @param {import('firebase/auth').User} firebaseUser
 */
export async function syncFirebaseUserToSupabase(firebaseUser) {
  if (!firebaseUser) return;

  const { uid, email, displayName, photoURL } = firebaseUser;

  const { error } = await supabase.from('profiles').upsert(
    {
      id: uid,
      email,
      full_name: displayName,
      avatar_url: photoURL,
    },
    { onConflict: 'id' }
  );

  if (error) {
    console.error('❌ Profile sync failed:', error.message);
  } else {
    console.log('✅ Profile synced to Supabase');
  }
}
