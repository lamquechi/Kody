# Backend Setup — Kody Lâm + Supabase

This connects your site to a real backend so newsletter signups and reader marks are stored in a database (not just one browser). Takes ~10 minutes. Free.

---

## What you get after this

| Feature | Before (offline) | After (Supabase) |
|---|---|---|
| Newsletter signup | saved in one browser | real subscriber list you can export |
| Reader marks / comments | one browser only | visible to you from any device, in Hub Inbox |
| Read counts | fake | real |
| (Phase 2) Login | none | you log in; Hub is protected |
| (Phase 3) Identity/draft sync | one browser | follows you across devices |

The site still works **without** this — it just stays single-browser. Setup is optional but recommended.

---

## Step 1 — Create a Supabase project

1. Go to **https://supabase.com** → sign in with GitHub (free)
2. Click **New project**
3. Name it (e.g. `water-memory`), set a strong database password (save it somewhere), pick the region closest to you
4. Wait ~2 minutes while it provisions

## Step 2 — Run the database setup

1. In your project, open **SQL Editor** (left sidebar)
2. Click **New query**
3. Open `supabase-setup.sql` from this folder, copy the **entire** contents
4. Paste into the editor → click **Run** (or Ctrl/Cmd + Enter)
5. You should see "Success. No rows returned." — that's correct

This creates all tables, security policies, and triggers.

## Step 3 — Get your keys

1. Open **Settings** (gear icon) → **API**
2. Copy two values:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

> The anon key is safe to put in client code — the database is protected by Row Level Security policies (set up in Step 2).

## Step 4 — Paste keys into wm-config.js

Open `wm-config.js` and replace the placeholders:

```js
window.WM_CONFIG = {
  supabaseUrl:     'https://abcdefgh.supabase.co',   // ← your Project URL
  supabaseAnonKey: 'eyJhbGci...'                     // ← your anon public key
};
```

Save the file.

## Step 5 — Deploy

Upload everything (including the updated `wm-config.js`) to your GitHub repo, same as before. Within a minute, your live site is talking to Supabase.

## Step 6 — Verify it works

1. Visit your live Home page → scroll to "Receive quiet letters" → enter an email → Subscribe
2. In Supabase → **Table Editor** → `subscribers` → you should see the email
3. Open any story → leave a mark at the bottom
4. In Supabase → `marks` table → you should see it
5. Open `/hub.html` → Inbox → the mark appears there too (synced from server)

---

## Important notes

- **Loading the SDK**: the site loads the Supabase JavaScript client from a CDN (`esm.sh`) at runtime. No build step needed. Requires the visitor to be online.
- **Offline fallback**: if `wm-config.js` still has placeholders, or the CDN can't load, the site automatically falls back to localStorage. Nothing breaks.
- **First account = admin**: in Phase 2 (auth), the first person to sign up becomes the admin automatically (handled by a database trigger). Sign up yourself first.
- **Free tier limits**: 500MB database, 50,000 monthly active users, 1GB file storage, 2GB bandwidth. Plenty for a personal literary site. You'll get an email long before you approach any limit.

---

## Troubleshooting

**Newsletter says "Could not subscribe"**
→ Check browser console (F12). Usually the keys in `wm-config.js` are wrong, or Step 2 SQL didn't run. Re-run the SQL.

**Marks not appearing in Hub**
→ Marks sync from the server on page load. Refresh the Hub. Check the `marks` table in Supabase to confirm they're being saved.

**"Failed to load Supabase SDK"**
→ The visitor is offline, or a network/firewall blocks `esm.sh`. The site falls back to localStorage automatically.

**Console shows RLS / permission errors**
→ The Row Level Security policies weren't created. Re-run `supabase-setup.sql` — it's safe to run multiple times.

---

## What's next (Phases 2 & 3)

Phase 1 (this) gives you newsletter + public marks + read counts. Still to come:

- **Phase 2 — Auth**: `login.html` / `signup.html`, protect Hub & Editor so only you can write
- **Phase 3 — Sync**: identity, drafts, and bookmarks follow you across devices when logged in

Ask to build these when you're ready.

---

# Phase 2 — Authentication (now included)

`login.html` is now part of the package. It handles both sign-in and account creation.

## One-time: make signup instant (recommended)

By default Supabase emails a confirmation link before a new account works. For a personal site you usually want to skip that:

1. Supabase → **Authentication** → **Providers** → **Email**
2. Turn **OFF** "Confirm email"
3. Save

Now the first signup logs you straight in.

## Create your admin account

1. Visit `/login.html` on your live site → **Create account** tab
2. Use your email + a strong password → Create account
3. **The first account automatically becomes admin** (database trigger handles this)
4. You're now signed in and can enter `/hub.html` and `/editor.html`

## How protection works

- `/hub.html` and `/editor.html` check your login when the backend is connected.
  - Not logged in → redirected to `/login.html`
  - Logged in but not admin → shown a polite "writer only" message
- When the backend is **not** connected (offline/demo mode), these pages stay open so the demo still works.
- Public pages (Home, Library, Reader, About, Motifs) never require login — readers just read.

## Sign out

Top-right of the Hub shows a **Sign out** button when you're logged in.

## What now syncs to the server (when you're logged in)

- **Identity** — editing your pen name/bio in Hub Settings writes to your `profiles` row
- **Site config** — site name/tagline/footer save to `site_config`
- **Marks** — already synced in Phase 1
- Drafts and bookmarks sync arrive in Phase 3.
