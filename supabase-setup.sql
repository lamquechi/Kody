-- ═══════════════════════════════════════════════════════════════
-- WATER & MEMORY · SUPABASE SETUP
-- ───────────────────────────────────────────────────────────────
-- Paste this whole file into Supabase → SQL Editor → New query → Run
-- One-time setup. Safe to re-run (uses IF NOT EXISTS).
-- ═══════════════════════════════════════════════════════════════

-- ─── TABLES ────────────────────────────────────────────────────

-- 1. PROFILES (extends auth.users)
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text default 'reader' check (role in ('admin','reader')),
  pen_name    text default '',
  call_name   text default '',
  initial     text default '',
  tagline     text default '',
  bio         text default '',
  email       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 2. PIECES (stories — published or draft)
create table if not exists pieces (
  id             text primary key,                        -- URL slug
  folio          text,                                    -- 'I', 'II', ...
  title          text not null,
  title_html     text,                                    -- optional styled HTML for reader
  lang           text default 'en' check (lang in ('en','vi')),
  form           text default 'fiction' check (form in ('fiction','tan-van','short','interactive')),
  motif          text,
  read_time      int default 5,
  status         text default 'draft' check (status in ('draft','scheduled','published')),
  published_at   timestamptz,
  description    text,
  excerpt        text,
  body           text,                                    -- markdown
  scenes         jsonb,                                   -- for interactive pieces
  theme_variant  text default 'velvet',
  reads          int default 0,
  author_id      uuid references profiles(id) on delete set null,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- 3. MARKS (anonymous reader notes / comments)
create table if not exists marks (
  id              uuid primary key default gen_random_uuid(),
  piece_id        text references pieces(id) on delete cascade,
  reader_id       uuid references profiles(id) on delete set null,
  text            text not null,
  read_by_author  boolean default false,
  created_at      timestamptz default now()
);

-- 4. BOOKMARKS (reader shelf)
create table if not exists bookmarks (
  reader_id   uuid references profiles(id) on delete cascade,
  piece_id    text references pieces(id) on delete cascade,
  created_at  timestamptz default now(),
  primary key (reader_id, piece_id)
);

-- 5. SUBSCRIBERS (newsletter)
create table if not exists subscribers (
  email           text primary key,
  subscribed_at   timestamptz default now(),
  confirmed       boolean default false,
  source          text                                    -- 'home' | 'about' | etc
);

-- 6. SITE_CONFIG (single-row brand customization)
create table if not exists site_config (
  id                  int primary key default 1 check (id = 1),
  site_name           text default 'Kody Lâm',
  site_mark           text default 'K',
  site_tagline        text default 'A small archive of rain, rooms, and unsent words.',
  site_footer_line    text default 'A quiet literary portfolio for a bilingual writer.',
  updated_at          timestamptz default now()
);
insert into site_config (id) values (1) on conflict do nothing;


-- ─── ROW LEVEL SECURITY ────────────────────────────────────────

alter table profiles      enable row level security;
alter table pieces        enable row level security;
alter table marks         enable row level security;
alter table bookmarks     enable row level security;
alter table subscribers   enable row level security;
alter table site_config   enable row level security;

-- helper: am I admin?
create or replace function is_admin() returns boolean
language sql security definer set search_path = public as $$
  select exists(select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- PROFILES
drop policy if exists "Public can read profiles" on profiles;
create policy "Public can read profiles" on profiles for select using (true);

drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Users update own profile" on profiles;
create policy "Users update own profile" on profiles
  for update using (auth.uid() = id);

-- PIECES
drop policy if exists "Public reads published pieces" on pieces;
create policy "Public reads published pieces" on pieces
  for select using (status = 'published' or auth.uid() = author_id or is_admin());

drop policy if exists "Authors and admin manage pieces" on pieces;
create policy "Authors and admin manage pieces" on pieces
  for all using (auth.uid() = author_id or is_admin());

-- MARKS
drop policy if exists "Anyone leaves a mark" on marks;
create policy "Anyone leaves a mark" on marks for insert with check (true);

drop policy if exists "Public reads marks" on marks;
create policy "Public reads marks" on marks for select using (true);

drop policy if exists "Admin updates marks" on marks;
create policy "Admin updates marks" on marks for update using (is_admin());

drop policy if exists "Admin deletes marks" on marks;
create policy "Admin deletes marks" on marks for delete using (is_admin());

-- BOOKMARKS (private per reader)
drop policy if exists "Readers manage own bookmarks" on bookmarks;
create policy "Readers manage own bookmarks" on bookmarks
  for all using (auth.uid() = reader_id);

-- SUBSCRIBERS
drop policy if exists "Anyone subscribes" on subscribers;
create policy "Anyone subscribes" on subscribers for insert with check (true);

drop policy if exists "Admin reads subscribers" on subscribers;
create policy "Admin reads subscribers" on subscribers for select using (is_admin());

drop policy if exists "Admin deletes subscribers" on subscribers;
create policy "Admin deletes subscribers" on subscribers for delete using (is_admin());

-- SITE_CONFIG
drop policy if exists "Public reads site config" on site_config;
create policy "Public reads site config" on site_config for select using (true);

drop policy if exists "Admin updates site config" on site_config;
create policy "Admin updates site config" on site_config for update using (is_admin());


-- ─── TRIGGERS ──────────────────────────────────────────────────

-- Auto-create profile on signup.
-- First user becomes admin automatically.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  user_role text;
begin
  if (select count(*) from profiles where role = 'admin') = 0 then
    user_role := 'admin';
  else
    user_role := 'reader';
  end if;

  insert into profiles (id, role, email)
  values (new.id, user_role, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


-- ─── HELPER FUNCTIONS ──────────────────────────────────────────

-- Increment read counter atomically (called from Reader on load)
create or replace function increment_reads(piece_id_param text)
returns void language plpgsql security definer set search_path = public as $$
begin
  update pieces set reads = reads + 1 where id = piece_id_param;
end;
$$;


-- ═══════════════════════════════════════════════════════════════
-- MIGRATION · The Studio (planning + SEO on pieces)
-- ───────────────────────────────────────────────────────────────
-- Additive and safe to re-run. Until you run it, the Studio still
-- works (planning + SEO live in your browser); running it persists
-- Progress, Word goals, Deadlines, planned Publishes and SEO fields
-- to Supabase so they follow you across devices.
-- Paste into Supabase → SQL Editor → Run.
-- ═══════════════════════════════════════════════════════════════
alter table pieces add column if not exists progress         text;        -- idea|outline|drafting|revising|done
alter table pieces add column if not exists word_goal        int  default 0;
alter table pieces add column if not exists due_at           timestamptz; -- deadline (shows on the Calendar)
alter table pieces add column if not exists scheduled_at     timestamptz; -- planned publish (shows on the Calendar)
alter table pieces add column if not exists meta_description text;        -- search summary (SEO)
alter table pieces add column if not exists focus_keyword    text;        -- focus phrase (SEO)
alter table pieces add column if not exists synopsis         text;        -- private note-to-self
alter table pieces add column if not exists characters       jsonb default '[]'::jsonb;  -- linked character ids
alter table pieces add column if not exists continued        boolean default false;      -- "to be continued" — piece is ongoing (more parts coming)

-- Characters (the company of a body of work) — private to the author.
create table if not exists characters (
  id          text primary key,
  author_id   uuid references profiles(id) on delete cascade,
  name        text,
  role        text,
  age         text,
  color       text,
  one_line    text,
  description text,
  arc         text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
alter table characters enable row level security;
drop policy if exists "Author manages characters" on characters;
create policy "Author manages characters" on characters
  for all using (auth.uid() = author_id or is_admin())
  with check (auth.uid() = author_id or is_admin());
-- Readers can see characters linked to pieces (the reader's character cards).
drop policy if exists "Public reads characters" on characters;
create policy "Public reads characters" on characters for select using (true);

-- Studio events (reminders / writing sessions / notes on the Calendar).
create table if not exists studio_events (
  id          text primary key,
  author_id   uuid references profiles(id) on delete cascade,
  type        text,                                    -- deadline|session|publish|note
  title       text,
  date        date,
  piece_id    text,                                    -- optional link to a piece
  note        text,
  done        boolean default false,
  created_at  timestamptz default now()
);
alter table studio_events enable row level security;
drop policy if exists "Author manages events" on studio_events;
create policy "Author manages events" on studio_events
  for all using (auth.uid() = author_id or is_admin())
  with check (auth.uid() = author_id or is_admin());

-- Messages (the About contact form → the Studio inbox).
create table if not exists messages (
  id              uuid primary key default gen_random_uuid(),
  name            text,
  email           text,
  body            text,
  read_by_author  boolean default false,
  created_at      timestamptz default now()
);
alter table messages enable row level security;
drop policy if exists "Anyone sends a message" on messages;
create policy "Anyone sends a message" on messages for insert with check (true);
drop policy if exists "Admin reads messages" on messages;
create policy "Admin reads messages" on messages for select using (is_admin());
drop policy if exists "Admin updates messages" on messages;
create policy "Admin updates messages" on messages for update using (is_admin());
drop policy if exists "Admin deletes messages" on messages;
create policy "Admin deletes messages" on messages for delete using (is_admin());


-- ═══════════════════════════════════════════════════════════════
-- DONE.
-- Next steps:
--   1. Settings → API → copy "Project URL" and "anon public" (publishable) key
--   2. Paste into your wm-config.js
--   3. Sign up the first account on /login.html — that account becomes admin automatically
--   4. (Optional) Run the MIGRATION block above to sync planning + SEO
-- ═══════════════════════════════════════════════════════════════
