/* ═══════════════════════════════════════════════════════════
   WATER & MEMORY · SUPABASE INTEGRATION  (wm-supabase.js)
   ───────────────────────────────────────────────────────────
   Loads AFTER wm-config.js and wm.js.
   When credentials are present, it extends WM with backend calls:
     - WM.online        true if connected
     - WM.user          current auth user (or null)
     - WM.isAdmin       boolean
     - WM.auth          { signUp, signIn, signOut, onChange }
     - WM.newsletter    { subscribe }
     - WM.marks.add     dual-writes to Supabase + localStorage
     - syncs marks + site config from server on load

   Falls back silently to localStorage-only when not configured.
   Fires window event 'wm:ready' (detail: { online }) when done.
   ═══════════════════════════════════════════════════════════ */

(async function () {
  const cfg = window.WM_CONFIG || {};
  const configured =
    cfg.supabaseUrl && cfg.supabaseAnonKey &&
    !cfg.supabaseUrl.includes('YOUR_') &&
    !cfg.supabaseAnonKey.includes('YOUR_');

  if (!configured) {
    console.info('[wm] Supabase not configured — running in offline (localStorage) mode.');
    WM.online = false;
    window.dispatchEvent(new CustomEvent('wm:ready', { detail: { online: false } }));
    return;
  }

  // Load Supabase SDK from CDN (ESM)
  let supabase;
  try {
    const mod = await import('https://esm.sh/@supabase/supabase-js@2');
    supabase = mod.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true }
    });
  } catch (e) {
    console.error('[wm] Could not load Supabase SDK:', e);
    WM.online = false;
    window.dispatchEvent(new CustomEvent('wm:ready', { detail: { online: false } }));
    return;
  }

  WM.supabase = supabase;
  WM.online = true;

  // ─── AUTH STATE ──────────────────────────────────────────
  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser();
    WM.user = user || null;
    WM.isAdmin = false;
    WM.profile = null;
    if (user) {
      const { data: profile } = await supabase
        .from('profiles').select('*').eq('id', user.id).single();
      WM.profile = profile || null;
      WM.isAdmin = profile?.role === 'admin';
      // Sync identity down from profile (server is source of truth when logged in)
      if (profile) {
        const localSet = WM.identity.__localSet || WM.identity.set;
        // Avoid triggering server write loop: write straight to localStorage
        localStorage.setItem('wm.identity', JSON.stringify({
          penName: profile.pen_name || '',
          callName: profile.call_name || '',
          initial: profile.initial || '',
          tagline: profile.tagline || '',
          email: profile.email || '',
          bio: profile.bio || ''
        }));
        WM.identity.apply();
      }
    }
  }
  await loadUser();

  WM.auth = {
    async signUp(email, password) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      return data;
    },
    async signIn(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await loadUser();
      return data;
    },
    async signInMagic(email) {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      return true;
    },
    async signOut() {
      await supabase.auth.signOut();
      WM.user = null; WM.isAdmin = false; WM.profile = null;
    },
    onChange(cb) {
      supabase.auth.onAuthStateChange((_event, session) => cb(session?.user || null));
    }
  };

  // ─── NEWSLETTER ──────────────────────────────────────────
  WM.newsletter = {
    async subscribe(email, source = 'home') {
      const clean = (email || '').trim().toLowerCase();
      if (!clean || !clean.includes('@')) throw new Error('Please enter a valid email.');
      const { error } = await supabase.from('subscribers').insert({ email: clean, source });
      // 23505 = unique violation = already subscribed (treat as success)
      if (error && error.code !== '23505') throw error;
      return { email: clean, already: error?.code === '23505' };
    }
  };

  // ─── MARKS: dual-write + sync ────────────────────────────
  const localMarksAdd = WM.marks.add.bind(WM.marks);
  WM.marks.add = function (mark) {
    const local = localMarksAdd(mark);             // instant local feedback
    supabase.from('marks').insert({
      piece_id: mark.storyId,
      reader_id: WM.user?.id || null,
      text: mark.text
    }).then(({ error }) => { if (error) console.error('[wm] mark insert', error); });
    return local;
  };

  const localMarkRead = WM.marks.markRead.bind(WM.marks);
  WM.marks.markRead = function (id) {
    localMarkRead(id);
    supabase.from('marks').update({ read_by_author: true }).eq('id', id)
      .then(({ error }) => { if (error) console.error('[wm] mark read', error); });
  };

  // ─── IDENTITY: sync up to profile when logged in ─────────
  if (WM.user) {
    const localIdentitySet = WM.identity.set.bind(WM.identity);
    WM.identity.set = function (data) {
      const merged = localIdentitySet(data);   // local + DOM update
      supabase.from('profiles').update({
        pen_name: merged.penName,
        call_name: merged.callName,
        initial: merged.initial,
        tagline: merged.tagline,
        email: merged.email,
        bio: merged.bio,
        updated_at: new Date().toISOString()
      }).eq('id', WM.user.id)
        .then(({ error }) => { if (error) console.error('[wm] profile sync', error); });
      return merged;
    };
  }

  // ─── SITE CONFIG: sync up when admin saves ───────────────
  if (WM.isAdmin) {
    const localSiteSet = WM.site.set.bind(WM.site);
    WM.site.set = function (data) {
      const merged = localSiteSet(data);
      supabase.from('site_config').update({
        site_name: merged.siteName,
        site_mark: merged.siteMark,
        site_tagline: merged.siteTagline,
        site_footer_line: merged.siteFooterLine,
        updated_at: new Date().toISOString()
      }).eq('id', 1)
        .then(({ error }) => { if (error) console.error('[wm] site sync', error); });
      return merged;
    };
  }

  // Pull recent marks from server → localStorage (server is source of truth)
  try {
    const { data: remote } = await supabase
      .from('marks')
      .select('id, piece_id, text, read_by_author, created_at, pieces(title)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (remote) {
      const formatted = remote.map(m => ({
        id: m.id,
        createdAt: new Date(m.created_at).getTime(),
        read: m.read_by_author,
        storyId: m.piece_id,
        storyTitle: m.pieces?.title || '',
        text: m.text
      }));
      localStorage.setItem('wm.marks', JSON.stringify(formatted));
    }
  } catch (e) {
    console.warn('[wm] mark sync skipped:', e.message);
  }

  // ─── SITE CONFIG: pull from server ───────────────────────
  try {
    const { data: sc } = await supabase.from('site_config').select('*').eq('id', 1).single();
    if (sc) {
      const mapped = {
        siteName: sc.site_name, siteMark: sc.site_mark,
        siteTagline: sc.site_tagline, siteFooterLine: sc.site_footer_line
      };
      // Only override local if server differs from defaults
      localStorage.setItem('wm.site', JSON.stringify(mapped));
      WM.site.apply();
    }
  } catch (e) {
    console.warn('[wm] site config sync skipped:', e.message);
  }

  // ─── READ COUNTER ────────────────────────────────────────
  WM.countRead = function (pieceId) {
    supabase.rpc('increment_reads', { piece_id_param: pieceId })
      .then(({ error }) => { if (error) console.debug('[wm] read count', error.message); });
  };

  // ─── DRAFTS: sync with pieces table (when logged in) ─────
  if (WM.user) {
    // Pull this author's drafts + pieces from server → localStorage
    try {
      const { data: rows } = await supabase
        .from('pieces')
        .select('*')
        .eq('author_id', WM.user.id)
        .order('updated_at', { ascending: false });
      if (rows && rows.length) {
        const draftsObj = {};
        rows.forEach(r => {
          draftsObj[r.id] = {
            title: r.title || '',
            body: r.body || '',
            status: r.status || 'draft',
            form: r.form,
            lang: r.lang,
            motif: r.motif,
            themeVariant: r.theme_variant,
            updatedAt: r.updated_at ? new Date(r.updated_at).getTime() : Date.now()
          };
        });
        // Merge: server is source of truth for this author's pieces
        const local = WM.drafts.all();
        localStorage.setItem('wm.drafts', JSON.stringify({ ...local, ...draftsObj }));
      }
    } catch (e) { console.warn('[wm] draft pull skipped:', e.message); }

    // Push on save (upsert into pieces)
    const localDraftsSave = WM.drafts.save.bind(WM.drafts);
    WM.drafts.save = function (id, data) {
      const saved = localDraftsSave(id, data);
      supabase.from('pieces').upsert({
        id: id,
        title: saved.title || 'Untitled',
        body: saved.body || '',
        status: saved.status || 'draft',
        form: saved.form || 'tan-van',
        lang: saved.lang || 'en',
        motif: saved.motif || null,
        theme_variant: saved.themeVariant || 'velvet',
        author_id: WM.user.id,
        published_at: saved.status === 'published' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
        .then(({ error }) => { if (error) console.error('[wm] draft push', error.message); });
      return saved;
    };

    const localDraftsDelete = WM.drafts.delete.bind(WM.drafts);
    WM.drafts.delete = function (id) {
      localDraftsDelete(id);
      supabase.from('pieces').delete().eq('id', id).eq('author_id', WM.user.id)
        .then(({ error }) => { if (error) console.error('[wm] draft delete', error.message); });
    };
  }

  // ─── BOOKMARKS: sync to bookmarks table (when logged in) ─
  if (WM.user) {
    try {
      const { data: rows } = await supabase
        .from('bookmarks')
        .select('piece_id')
        .eq('reader_id', WM.user.id);
      if (rows) {
        localStorage.setItem('wm.shelf', JSON.stringify(rows.map(r => r.piece_id)));
      }
    } catch (e) { console.warn('[wm] bookmark pull skipped:', e.message); }

    const localShelfToggle = WM.shelf.toggle.bind(WM.shelf);
    WM.shelf.toggle = function (pieceId) {
      const nowSaved = localShelfToggle(pieceId);
      if (nowSaved) {
        supabase.from('bookmarks').insert({ reader_id: WM.user.id, piece_id: pieceId })
          .then(({ error }) => { if (error && error.code !== '23505') console.error('[wm] bookmark add', error.message); });
      } else {
        supabase.from('bookmarks').delete().eq('reader_id', WM.user.id).eq('piece_id', pieceId)
          .then(({ error }) => { if (error) console.error('[wm] bookmark remove', error.message); });
      }
      return nowSaved;
    };
  }

  console.info('[wm] Supabase ready · user:', WM.user?.email || 'anonymous', '· admin:', WM.isAdmin);
  window.dispatchEvent(new CustomEvent('wm:ready', { detail: { online: true, user: WM.user } }));
})();
