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
  supabaseUrl:     'https://mfxmiufilgiipiyjkulu.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1meG1pdWZpbGdpaXBpeWprdWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNTI1NjksImV4cCI6MjA5NTcyODU2OX0.x-XlvQsGhqZNdIqnpEZNGohOxRm6VcPm3A6kTRV4RMM',

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
  // ── Admin login (private studio) ───────────────────────────
  // The Writer Hub + Editor are yours alone. Choose ONE method:
  //
  //  • BEST (real security): connect Supabase above, then log in with
  //    your account. Only your logged-in admin account can enter.
  //
  //  • QUICK (works offline): set a username AND password below. Anyone
  //    opening the Hub must type BOTH correctly. This is a light gate —
  //    the values live in this file, so it is not bank-level security,
  //    but it stops anyone who doesn't know your username + password.
  //    Leave BOTH blank to disable the lock (open/demo mode).
  adminUser:     '',   // e.g. 'kody'
  adminPassword: '',   // e.g. 'mua-thang-sau-2026'

  // ── Beta readers (optional) ────────────────────────────────
  // A separate, gentler door. Beta readers you trust can read your
  // works-in-progress at beta.html and leave private notes — without
  // ever reaching the admin studio. Give them this passphrase only.
  // Leave '' to keep the beta room closed.
  betaPassphrase: '',  // e.g. 'phong-doc-rieng'

  // ── Contact address (optional) ─────────────────────────────
  // If set, the About page's "get in touch" form opens the visitor's
  // mail app addressed to you. Leave '' to instead add them to the
  // quiet-letter list (subscribers). e.g. 'you@email.com'
  contactEmail: ''
};
