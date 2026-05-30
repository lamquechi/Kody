/* ═══════════════════════════════════════════════════════════
   WATER & MEMORY · CONFIG
   ───────────────────────────────────────────────────────────
   Paste your Supabase credentials below to enable the backend.
   Find them at: Supabase Dashboard → Settings → API

   - Project URL  → supabaseUrl
   - anon public  → supabaseAnonKey  (safe to expose; RLS protects data)

   Leave the placeholders as-is to run in offline (localStorage-only) mode.
   ═══════════════════════════════════════════════════════════ */

window.WM_CONFIG = {
  supabaseUrl:     'YOUR_SUPABASE_URL_HERE',       // e.g. https://abcdefgh.supabase.co
  supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY_HERE',  // long string starting with "eyJ..."

  // ── Admin lock (optional) ──────────────────────────────────
  // The Writer Hub + Editor are private. To keep them yours:
  //
  //  • BEST (real security): connect Supabase above. Then only your
  //    logged-in admin account can open the Hub. See SETUP.md.
  //
  //  • QUICK (a simple lock): set a passphrase below. Anyone opening
  //    the Hub must type it. This is a light gate — good enough to
  //    stop casual visitors, but the passphrase lives in this file,
  //    so it is NOT bank-level security. Leave '' to disable.
  adminPassphrase: '',  // e.g. 'mưa-tháng-sáu'  (set your own)

  // ── Beta readers (optional) ────────────────────────────────
  // A separate, gentler door. Beta readers you trust can read your
  // works-in-progress at beta.html and leave private notes — without
  // ever reaching the admin studio. Give them this passphrase only.
  // Leave '' to keep the beta room closed.
  betaPassphrase: ''   // e.g. 'phong-doc-rieng'
};
