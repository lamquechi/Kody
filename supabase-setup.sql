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
-- EXTENSION · ②③④  characters · chapters · slug + SEO
-- (Safe to run on an existing database — all additive / idempotent.)
-- ═══════════════════════════════════════════════════════════════

-- ④ — PIECES: human URL slug + SEO fields (the Editor already collects these)
alter table pieces add column if not exists slug            text;
alter table pieces add column if not exists seo_title       text;
alter table pieces add column if not exists seo_description  text;
alter table pieces add column if not exists seo_keywords     text;
alter table pieces add column if not exists seo_image        text;
alter table pieces add column if not exists seo_canonical    text;
alter table pieces add column if not exists seo_author       text default 'Kody Lâm';
alter table pieces add column if not exists seo_focus        text;
alter table pieces add column if not exists seo_index        boolean default true;

-- backfill slug from id for existing rows, then enforce uniqueness
update pieces set slug = id where slug is null;
create unique index if not exists pieces_slug_key on pieces (slug);
create index        if not exists pieces_status_published_idx on pieces (status, published_at desc);

-- ② — CHARACTERS (name · lai lịch · tính cách), reusable across pieces
create table if not exists characters (
  id           text primary key,           -- client-generated (e.g. 'c-…'), matches WM.characters
  name         text not null,
  aka          text,                       -- alternate / nicknames
  initial      text,                       -- portrait letter
  bio          text,                       -- lai lịch / background
  personality  text,                       -- tính cách
  role         text,                       -- 'main' | 'recurring' | 'supporting' | …
  color        text default '#C9A961',     -- accent colour for the tooltip
  author_id    uuid references profiles(id) on delete set null,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- which characters appear in which pieces (many-to-many)
create table if not exists piece_characters (
  piece_id      text references pieces(id) on delete cascade,
  character_id  text references characters(id) on delete cascade,
  note          text,                       -- optional per-piece note
  primary key (piece_id, character_id)
);
create index if not exists piece_characters_piece_idx on piece_characters (piece_id);

-- ③ — CHAPTERS (a piece may have many; each with its own mood / theme / sound)
create table if not exists chapters (
  id             text primary key,          -- client-generated, matches WM.chapters
  piece_id       text references pieces(id) on delete cascade,
  idx            int default 0,             -- order within the piece
  title          text,
  body           text,                      -- markdown
  mood           text,                      -- free-text mood / effect name
  theme_variant  text,                      -- per-chapter reader skin (velvet/mercury/…)
  sound          text,                      -- ambient sound key or URL
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);
create index if not exists chapters_piece_idx on chapters (piece_id, idx);

-- ─── RLS for the new tables ───
alter table characters       enable row level security;
alter table piece_characters enable row level security;
alter table chapters         enable row level security;

-- CHARACTERS: public may read (tooltips on published pieces); author/admin manage
drop policy if exists "Public reads characters" on characters;
create policy "Public reads characters" on characters for select using (true);
drop policy if exists "Author/admin manage characters" on characters;
create policy "Author/admin manage characters" on characters
  for all using (auth.uid() = author_id or is_admin())
  with check (auth.uid() = author_id or is_admin());

-- PIECE_CHARACTERS: public read; author of the piece (or admin) manages links
drop policy if exists "Public reads piece_characters" on piece_characters;
create policy "Public reads piece_characters" on piece_characters for select using (true);
drop policy if exists "Author/admin manage piece_characters" on piece_characters;
create policy "Author/admin manage piece_characters" on piece_characters
  for all using (
    is_admin() or exists (select 1 from pieces p where p.id = piece_id and p.author_id = auth.uid())
  ) with check (
    is_admin() or exists (select 1 from pieces p where p.id = piece_id and p.author_id = auth.uid())
  );

-- CHAPTERS: readable when the parent piece is readable; author/admin manage
drop policy if exists "Public reads chapters of published" on chapters;
create policy "Public reads chapters of published" on chapters
  for select using (
    exists (select 1 from pieces p where p.id = piece_id
            and (p.status = 'published' or p.author_id = auth.uid() or is_admin()))
  );
drop policy if exists "Author/admin manage chapters" on chapters;
create policy "Author/admin manage chapters" on chapters
  for all using (
    is_admin() or exists (select 1 from pieces p where p.id = piece_id and p.author_id = auth.uid())
  ) with check (
    is_admin() or exists (select 1 from pieces p where p.id = piece_id and p.author_id = auth.uid())
  );


-- ═══════════════════════════════════════════════════════════════
-- DONE.
-- Next steps:
--   1. Settings → API → copy "Project URL" and "anon public" key
--   2. Paste into your wm-config.js
--   3. Sign up the first account on /login.html — that account becomes admin automatically
-- ═══════════════════════════════════════════════════════════════
