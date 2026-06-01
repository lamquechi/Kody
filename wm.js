/* ═══════════════════════════════════════════════════════════
   WATER & MEMORY · shared data + utilities (wm.js)
   ───────────────────────────────────────────────────────────
   Loaded by all pages. Contains:
   - WM.stories   : all pieces (data)
   - WM.motifs    : motif metadata
   - WM.renderMarkdown(src) → html
   - WM.getStory(id), WM.getStoriesByMotif(motif)
   - WM.identity  : get/set/apply identity (localStorage)
   - WM.site      : get/set/apply site config (localStorage)
   - WM.drafts    : get/save piece drafts (localStorage)
   ═══════════════════════════════════════════════════════════ */

window.WM = (function () {

  /* ─── STORIES ──────────────────────────────────────────── */
  const stories = [
    {
      id: 'the-city-after-rain',
      folio: 'I',
      title: 'The City After Rain',
      titleHTML: 'The <em>City</em><br>After Rain',
      lang: 'en',
      form: 'fiction',
      motif: 'rain',
      readTime: 5,
      status: 'published',
      publishedAt: '2026-05-17',
      reads: 412,
      marks: 3,
      description: 'A woman delays going home and lets the city hold her for a few more minutes after the rain.',
      excerpt: 'After the rain, the city no longer looked like a city. It looked like something remembering itself.',
      body: `After the rain, the city no longer looked like a city. It looked like something *remembering itself*.

The windows along the avenue held light the way wet stones hold warmth: briefly, carefully, as if they already knew it would leave.

She stood beneath a convenience-store awning and watched motorbikes pass in glittering fragments. Everything felt slightly delayed: the traffic, the evening, the answer she had not sent.

> There are nights when going home feels less like return and more like surrender.

There are nights when going home feels less like return and more like surrender. She was not afraid of the room itself. She was afraid of what silence would say once the door closed.

So she stayed outside long enough to feel the air change. Long enough to let the rain take the sharp edges off the day. Long enough to believe that unfinished courage might still count as courage.

Then she started walking, not because she was ready, but because readiness is often a story people tell after movement, never before.`
    },
    {
      id: 'letters-to-the-reservoir',
      folio: 'II',
      title: 'Letters to the Reservoir',
      titleHTML: 'Letters to the <em>Reservoir</em>',
      lang: 'en',
      form: 'short',
      motif: 'water',
      readTime: 3,
      status: 'published',
      publishedAt: '2026-05-10',
      reads: 298,
      marks: 2,
      description: 'A brief piece about stored water, stored feeling, and the strange patience of memory.',
      excerpt: 'Some memories do not vanish. They settle, like water held behind concrete, waiting for weather.',
      body: `Some memories do not vanish. They settle, like water held behind concrete, *waiting for weather*.

I have always distrusted the language of closure. It sounds too architectural, too final, as if the heart were a room and not a landscape.

What I understand better is storage: the way feeling can remain somewhere beneath the surface, quiet but present, changing its color with the light.

> They do not perform healing. They simply keep what they keep.

Perhaps that is why I am drawn to reservoirs, ponds, window glass after rain. They do not perform healing. They simply keep what they keep.

And maybe a life is not measured by what disappears, but by what can be held without overflowing.`
    },
    {
      id: 'in-a-room-of-small-lights',
      folio: 'III',
      title: 'In a Room of Small Lights',
      titleHTML: 'In a Room of <em>Small Lights</em>',
      lang: 'en',
      form: 'tan-van',
      motif: 'window',
      readTime: 4,
      status: 'published',
      publishedAt: '2026-05-03',
      reads: 221,
      marks: 4,
      description: 'On low lamps, evening apartments, and the intimacy of surviving softly.',
      excerpt: 'A room lit by small lamps asks for a different honesty than daylight does.',
      body: `A room lit by small lamps asks for a different honesty than daylight does.

In bright rooms, people explain themselves. In dim ones, they reveal themselves by accident: in pauses, in posture, in the way they hold a cup too long after the tea has cooled.

> Evening has always felt more accurate to me than noon.

I think that is why evening has always felt more accurate to me than noon. It is less declarative. Less certain. Closer to the language most feelings actually speak.

Some lives are not rebuilt through revelation. They are steadied by smaller things: a lamp, a chair near the window, one page written honestly, one night passed without collapse.

There is a kind of bravery that does not announce itself. It simply keeps the room warm.`
    },
    {
      id: 'mirror-city-notes',
      folio: 'IV',
      title: 'Mirror City Notes',
      titleHTML: '<em>Mirror City</em><br>Notes',
      lang: 'en',
      form: 'tan-van',
      motif: 'city',
      readTime: 4,
      status: 'published',
      publishedAt: '2026-04-26',
      reads: 130,
      marks: 1,
      description: 'A reflection on modern city life, comparison, and the quiet violence of being watched by surfaces.',
      excerpt: 'In a city full of glass, self-consciousness becomes a climate.',
      body: `In a city full of glass, *self-consciousness becomes a climate*.

You see yourself reflected in shop windows, office towers, elevator doors, phone screens. None of these reflections are complete, but each one asks for judgment anyway.

At some point you stop asking what kind of life you want and begin asking whether your life is legible enough, polished enough, enviable enough to survive being seen.

> The city is not only cruel.

But the city is not only cruel. Sometimes it also returns you to yourself in a usable way: a late bus window, a puddle, an apartment balcony lit in yellow. A surface that shows you not as performance, but as presence.`
    },
    {
      id: 'the-language-of-unfinished-things',
      folio: 'V',
      title: 'The Language of Unfinished Things',
      titleHTML: 'The Language of<br><em>Unfinished</em> Things',
      lang: 'en',
      form: 'short',
      motif: 'draft',
      readTime: 3,
      status: 'published',
      publishedAt: '2026-04-19',
      reads: 176,
      marks: 2,
      description: 'A fragment on abandoned drafts, half-kept promises, and why unfinished work still matters.',
      excerpt: 'Not every unfinished thing is a failure. Some are rooms we were not ready to enter.',
      body: `Not every unfinished thing is a failure. *Some are rooms we were not ready to enter*.

A draft can wait without accusing you. It keeps the shape of your attempt, the temperature of your first courage, the record of a version of you who tried to begin.

> Returning is also a form of loyalty.

I used to think completion was the only way to honor an idea. Now I think returning is also a form of loyalty.

Maybe the unfinished things are not proof that we are inconsistent. Maybe they are proof that something in us continues to ask for language.`
    },
    {
      id: 'saigon-after-eleven',
      folio: 'VI',
      title: 'Saigon After Eleven',
      titleHTML: '<em>Saigon</em><br>After Eleven',
      lang: 'en',
      form: 'fiction',
      motif: 'night',
      readTime: 5,
      status: 'published',
      publishedAt: '2026-05-26',
      reads: 28,
      marks: 0,
      description: 'A quiet nighttime fiction piece about movement, hesitation, and a city that refuses to sleep on time.',
      excerpt: 'After eleven, the city did not sleep. It only lowered its voice.',
      body: `After eleven, the city did not sleep. *It only lowered its voice*.

The neon signs stayed awake above the narrow streets. Somewhere, a metal shutter fell with a sound like a sentence ending. Somewhere else, a bowl of noodles steamed under fluorescent light.

He rode slowly, not because of traffic, but because arriving too soon would require a decision. The city gave him excuses: a red light, a wet road, a dog crossing without fear.

> It was easier to look waiting than to admit he was afraid of being answered.

At the corner, he stopped and checked his phone though no message had arrived. It was easier to look waiting than to admit he was afraid of being answered.

Saigon, generous in its restlessness, kept moving around him. For a few more minutes, he borrowed its motion and called it peace.`
    },
    {
      id: 'mot-nua-cua-im-lang',
      folio: 'VII',
      title: 'Một Nửa Của Im Lặng',
      titleHTML: '<em>Một Nửa</em><br>Của Im Lặng',
      lang: 'vi',
      form: 'tan-van',
      motif: 'silence',
      readTime: 4,
      status: 'published',
      publishedAt: '2026-05-06',
      reads: 186,
      marks: 4,
      description: 'Một tản văn ngắn bằng tiếng Việt về im lặng, dịu dàng, và phần cảm xúc chưa kịp gọi tên.',
      excerpt: 'Có những im lặng không phải vì hết điều để nói, mà vì lòng người đang tìm một cách nói ít đau hơn.',
      body: `Có những im lặng không phải vì hết điều để nói, mà vì *lòng người đang tìm một cách nói ít đau hơn*.

Tôi từng nghĩ im lặng là khoảng trống. Sau này mới hiểu, nhiều khi im lặng là một căn phòng rất đầy: đầy những câu chưa kịp sắp xếp, những nỗi buồn còn đang học cách đứng yên, những dịu dàng sợ bị hiểu sai.

Người ta hay bảo phải nói ra thì mới nhẹ lòng. Nhưng có những điều, nếu nói quá sớm, sẽ vỡ. Nếu nói quá muộn, sẽ thành một vết mờ không ai còn đọc được.

> Chỉ để nó có một chỗ tồn tại tử tế.

Vậy nên đôi khi tôi chỉ ngồi với im lặng của mình. Không cố thắng nó, không cố giải thích nó. Chỉ để nó có một chỗ tồn tại tử tế.

Biết đâu, một nửa của im lặng là tổn thương. Nửa còn lại là cách chúng ta vẫn cố giữ cho lòng mình không trở nên thô ráp.`
    },
    /* ─── INTERACTIVE SAMPLE ─── */
    {
      id: 'a-door-at-three-am',
      folio: 'VIII',
      title: 'A Door at Three AM',
      titleHTML: 'A <em>Door</em><br>at Three AM',
      lang: 'en',
      form: 'fiction',
      motif: 'night',
      themeVariant: 'mercury',
      readTime: 6,
      status: 'published',
      publishedAt: '2026-05-22',
      reads: 94,
      marks: 5,
      description: 'A short night piece — a door, a kettle, and the silence on the other side.',
      excerpt: 'You arrive at the door at 3 AM. The lights are still on inside.',
      body: `You arrive at the door at three AM. *The lights are still on inside.*

You can hear, faintly, the kettle settling. Someone is awake who shouldn't be.

> The street behind you has already forgotten you came.

You have three minutes before the rain starts again. You knock. The kettle stops.

After a long pause, the door opens. A face you have not seen in two years stands in the warm light, holding a cup. *Neither of you speaks first.*

The rain begins. You both look at it.

"You came," they say. Not a question.

> Some doors only open when you have learned what to do with the silence on the other side.

You step inside.`,
      scenes: {
        start: {
          body: `You arrive at the door at three AM. *The lights are still on inside.*

You can hear, faintly, the kettle settling. Someone is awake who shouldn't be.

> The street behind you has already forgotten you came.

You have three minutes before the rain starts again.`,
          choices: [
            { label: 'Knock.',                     next: 'knock' },
            { label: 'Wait under the eave.',       next: 'wait'  },
            { label: 'Walk away. Send a message.', next: 'leave' }
          ]
        },
        knock: {
          body: `You knock. The kettle stops.

After a long pause, the door opens. A face you have not seen in two years stands in the warm light, holding a cup. *Neither of you speaks first.*

The rain begins. You both look at it.

"You came," they say. Not a question.

> Some doors only open when you have learned what to do with the silence on the other side.

You step inside.`,
          ending: 'ENDING · THE KETTLE'
        },
        wait: {
          body: `You stand under the eave. The rain begins, gentle at first.

Inside, you hear footsteps. The kettle settles. A chair pulled back. *None of these sounds are for you.*

The light goes out at 3:18 AM. You wait another minute, then start walking. The rain has stopped pretending to be gentle.

> Some windows are not invitations. They are just lit.

You did not come here to be answered. You came here to know that the kettle was still warm.`,
          ending: 'ENDING · THE EAVE'
        },
        leave: {
          body: `You walk away. The street is empty enough that your footsteps sound like an apology.

You take out your phone, but you do not know what to type.

> "I came to your door tonight" — too much.
> "Are you awake?" — too little.

You put the phone away.

Halfway home, you stop and turn back. The light is still on. The kettle, you imagine, is still warm. You stand at the corner for a long time, learning the difference between *almost* and *not yet*.`,
          ending: 'ENDING · THE CORNER'
        }
      }
    }
  ];

  /* ─── MOTIFS ──────────────────────────────────────────── */
  const motifs = {
    rain:    { name: 'Rain',    color: '#7AAEC4', subtitle: 'falling water · weather as permission' },
    water:   { name: 'Water',   color: '#6A8C7B', subtitle: 'held · stored · the patience of memory' },
    window:  { name: 'Window',  color: '#C25535', subtitle: 'the frame · what we see but do not touch' },
    silence: { name: 'Silence', color: '#C9A961', subtitle: 'a room so full it cannot speak' },
    night:   { name: 'Night',   color: '#8A82B5', subtitle: 'the hour the city lowers its voice' },
    city:    { name: 'City',    color: '#9B9282', subtitle: 'the weather of being seen' },
    draft:   { name: 'Draft',   color: '#B89047', subtitle: 'the unfinished · a loyalty of return' }
  };

  /* ─── THEME VARIANTS (per-story Reader skin) ──────────── */
  const themes = {
    velvet:  { name: 'Velvet',     night: '#0E0B16', gold: '#C9A961', oxblood: '#6E1F22' },
    mercury: { name: 'Thuỷ ngân',  night: '#0A1218', gold: '#7AAEC4', oxblood: '#2D4A5C' },
    amber:   { name: 'Hổ phách',   night: '#15110D', gold: '#D38C4E', oxblood: '#5C3A1F' },
    moss:    { name: 'Rêu xanh',   night: '#0D1410', gold: '#8DAE7A', oxblood: '#3D5642' }
  };

  /* ─── HELPERS ──────────────────────────────────────────── */
  function getStory(id) {
    return stories.find(s => s.id === id) || null;
  }
  function getStoriesByMotif(motif) {
    return stories.filter(s => s.motif === motif);
  }
  function getRelatedStories(currentId, limit = 3) {
    const current = getStory(currentId);
    if (!current) return stories.slice(0, limit);
    return stories
      .filter(s => s.id !== currentId)
      .sort((a, b) => {
        // Prefer same motif, then same form, then anything
        const aScore = (a.motif === current.motif ? 2 : 0) + (a.form === current.form ? 1 : 0);
        const bScore = (b.motif === current.motif ? 2 : 0) + (b.form === current.form ? 1 : 0);
        return bScore - aScore;
      })
      .slice(0, limit);
  }

  /* ─── URL PARAMS ──────────────────────────────────────── */
  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  /* ─── MARKDOWN RENDERER ──────────────────────────────── */
  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function renderMarkdown(src) {
    if (!src || !src.trim()) return '<p class="empty">— empty —</p>';

    const lines = src.split('\n');
    const html = [];
    let inList = false;

    function inline(s) {
      s = escapeHtml(s);
      s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2">');
      s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
      s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      s = s.replace(/(?<!\*)\*(?!\*)([^*\n]+?)\*(?!\*)/g, '<em>$1</em>');
      s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
      return s;
    }

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      if (inList && !line.match(/^-\s/) && line.trim() !== '') {
        html.push('</ul>'); inList = false;
      }
      if (line.trim() === '') { if (inList) { html.push('</ul>'); inList = false; } continue; }
      if (line.match(/^###\s+(.+)$/)) { html.push('<h3>' + inline(line.replace(/^###\s+/, '')) + '</h3>'); continue; }
      if (line.match(/^##\s+(.+)$/))  { html.push('<h2>' + inline(line.replace(/^##\s+/, '')) + '</h2>'); continue; }
      if (line.match(/^#\s+(.+)$/))   { html.push('<h1>' + inline(line.replace(/^#\s+/, '')) + '</h1>'); continue; }
      if (line.match(/^---+$/))       { html.push('<hr>'); continue; }
      if (line.match(/^>\s?(.+)$/)) {
        const quote = [];
        while (i < lines.length && lines[i].match(/^>\s?/)) {
          quote.push(inline(lines[i].replace(/^>\s?/, ''))); i++;
        }
        i--;
        html.push('<blockquote>' + quote.join('<br>') + '</blockquote>');
        continue;
      }
      if (line.match(/^-\s+(.+)$/)) {
        if (!inList) { html.push('<ul>'); inList = true; }
        html.push('<li>' + inline(line.replace(/^-\s+/, '')) + '</li>');
        continue;
      }
      // paragraph
      const para = [inline(line)];
      while (i + 1 < lines.length && lines[i + 1].trim() !== '' && !lines[i + 1].match(/^(#|>|---|-\s)/)) {
        para.push(inline(lines[i + 1])); i++;
      }
      html.push('<p>' + para.join(' ') + '</p>');
    }
    if (inList) html.push('</ul>');
    return html.join('\n');
  }

  /* ─── IDENTITY (localStorage) ─────────────────────────── */
  const IDENTITY_KEY = 'wm.identity';
  const IDENTITY_DEFAULT = { penName: '', callName: '', initial: '', tagline: '', email: '', bio: '' };

  const identity = {
    get() {
      try { return { ...IDENTITY_DEFAULT, ...(JSON.parse(localStorage.getItem(IDENTITY_KEY)) || {}) }; }
      catch { return { ...IDENTITY_DEFAULT }; }
    },
    set(data) {
      const merged = { ...this.get(), ...data };
      localStorage.setItem(IDENTITY_KEY, JSON.stringify(merged));
      this.apply();
      return merged;
    },
    clear() { localStorage.removeItem(IDENTITY_KEY); this.apply(); },
    apply() {
      const id = this.get();
      const hasName = !!(id.penName || '').trim();
      const displayName = hasName ? id.penName : '— Your name —';
      const callName = id.callName || (id.penName || '').split(' ')[0] || '';
      const initial = (id.initial || (callName[0] || '·')).toUpperCase().slice(0, 2);

      document.querySelectorAll('[data-identity="name"]').forEach(el => {
        el.textContent = displayName;
        el.classList.toggle('placeholder', !hasName);
        if (hasName) { el.style.color = ''; el.style.fontStyle = ''; }
        else { el.style.color = 'var(--ink-faint, #978B7E)'; el.style.fontStyle = 'italic'; }
      });
      document.querySelectorAll('[data-identity="initial"]').forEach(el => { el.textContent = initial; });
      document.querySelectorAll('[data-identity="callName"]').forEach(el => { el.textContent = callName || 'friend'; });
      document.querySelectorAll('[data-identity="greeting"]').forEach(el => {
        el.innerHTML = hasName && callName
          ? 'Welcome back, <em>' + escapeHtml(callName) + '</em>.'
          : 'Welcome back to the <em>atelier</em>.';
      });
      document.querySelectorAll('[data-identity="tagline"]').forEach(el => {
        if (id.tagline) { el.textContent = id.tagline; el.classList.remove('placeholder'); }
        else { el.textContent = el.dataset.fallback || ''; el.classList.add('placeholder'); }
      });
      document.querySelectorAll('[data-identity="bio"]').forEach(el => {
        const fallback = el.dataset.fallback || '';
        if (id.bio) { el.textContent = '"' + id.bio + '"'; el.classList.remove('placeholder'); }
        else { el.textContent = fallback ? '"' + fallback + '"' : ''; el.classList.add('placeholder'); }
      });
      document.querySelectorAll('[data-identity="byline"]').forEach(el => {
        el.textContent = hasName ? 'by ' + id.penName : (el.dataset.fallback || '— byline pending —');
        el.classList.toggle('placeholder', !hasName);
      });
    }
  };

  /* ─── SITE CONFIG (localStorage) ──────────────────────── */
  const SITE_KEY = 'wm.site';
  const SITE_DEFAULT = {
    siteName: 'Kody Lâm',
    siteMark: 'K',
    siteTagline: 'A small archive of rain, rooms, and unsent words.',
    siteFooterLine: 'A quiet literary portfolio for a bilingual writer.',
    defaultLang: 'en'
  };

  const site = {
    get() {
      try { return { ...SITE_DEFAULT, ...(JSON.parse(localStorage.getItem(SITE_KEY)) || {}) }; }
      catch { return { ...SITE_DEFAULT }; }
    },
    set(data) {
      const merged = { ...this.get(), ...data };
      localStorage.setItem(SITE_KEY, JSON.stringify(merged));
      this.apply();
      return merged;
    },
    clear() { localStorage.removeItem(SITE_KEY); this.apply(); },
    isDefault() {
      const s = this.get();
      return s.siteName === SITE_DEFAULT.siteName &&
             s.siteMark === SITE_DEFAULT.siteMark &&
             s.siteTagline === SITE_DEFAULT.siteTagline &&
             s.siteFooterLine === SITE_DEFAULT.siteFooterLine;
    },
    apply() {
      const s = this.get();
      // Only touch DOM if user has customized — preserves stylized defaults
      if (this.isDefault()) return;
      document.querySelectorAll('[data-site="name"]').forEach(el => { el.textContent = s.siteName; el.removeAttribute('lang'); });
      document.querySelectorAll('[data-site="mark"]').forEach(el => { el.textContent = s.siteMark; });
      document.querySelectorAll('[data-site="tagline"]').forEach(el => { el.textContent = s.siteTagline; });
      document.querySelectorAll('[data-site="footerLine"]').forEach(el => { el.textContent = s.siteFooterLine; });
      // Also update document <title> suffix where present
      if (document.title.includes('Kody Lâm')) {
        document.title = document.title.replace('Kody Lâm', s.siteName);
      }
    }
  };

  /* ─── PRESENCE / ELSEWHERE LINKS (localStorage) ───────── */
  const PRESENCE_KEY = 'wm.presence';
  const PRESENCE_DEFAULT = { newsletter: '', instagram: '', selectedWork: '', email: '' };
  const presence = {
    get() {
      try { return { ...PRESENCE_DEFAULT, ...(JSON.parse(localStorage.getItem(PRESENCE_KEY)) || {}) }; }
      catch { return { ...PRESENCE_DEFAULT }; }
    },
    set(data) {
      const merged = { ...this.get(), ...data };
      localStorage.setItem(PRESENCE_KEY, JSON.stringify(merged));
      this.apply();
      return merged;
    },
    clear() { localStorage.removeItem(PRESENCE_KEY); },
    apply() {
      // Public site hooks: [data-presence="newsletter|instagram|selectedWork|email"]
      const p = this.get();
      document.querySelectorAll('[data-presence]').forEach(el => {
        const key = el.dataset.presence;
        const val = p[key];
        if (val) { el.setAttribute('href', key === 'email' ? 'mailto:' + val : val); }
      });
    }
  };

  /* ─── READER PREFS (localStorage) ─────────────────────── */
  const READER_KEY = 'wm.reader.prefs';
  const READER_DEFAULT = { fontSize: 20, theme: 'night', width: 680 };
  const reader = {
    get() {
      try { return { ...READER_DEFAULT, ...(JSON.parse(localStorage.getItem(READER_KEY)) || {}) }; }
      catch { return { ...READER_DEFAULT }; }
    },
    set(data) {
      const merged = { ...this.get(), ...data };
      localStorage.setItem(READER_KEY, JSON.stringify(merged));
      return merged;
    }
  };

  /* ─── MARKS (reader comments) ─────────────────────────── */
  const MARKS_KEY = 'wm.marks';
  const marks = {
    all() {
      try { return JSON.parse(localStorage.getItem(MARKS_KEY)) || []; }
      catch { return []; }
    },
    add(mark) {
      const all = this.all();
      all.unshift({
        id: 'm-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        createdAt: Date.now(),
        read: false,
        ...mark
      });
      localStorage.setItem(MARKS_KEY, JSON.stringify(all.slice(0, 200)));
      return all[0];
    },
    markRead(id) {
      const all = this.all();
      const m = all.find(x => x.id === id);
      if (m) { m.read = true; localStorage.setItem(MARKS_KEY, JSON.stringify(all)); }
    },
    forStory(storyId) {
      return this.all().filter(m => m.storyId === storyId);
    },
    unreadCount() {
      return this.all().filter(m => !m.read).length;
    },
    clear() { localStorage.removeItem(MARKS_KEY); }
  };

  /* ─── BOOKMARKS / SHELF ───────────────────────────────── */
  const SHELF_KEY = 'wm.shelf';
  const shelf = {
    all() {
      try { return JSON.parse(localStorage.getItem(SHELF_KEY)) || []; }
      catch { return []; }
    },
    toggle(storyId) {
      const all = this.all();
      const idx = all.indexOf(storyId);
      if (idx >= 0) all.splice(idx, 1);
      else all.unshift(storyId);
      localStorage.setItem(SHELF_KEY, JSON.stringify(all));
      return all.indexOf(storyId) >= 0;
    },
    has(storyId) { return this.all().includes(storyId); }
  };

  /* ─── DRAFTS (localStorage) ───────────────────────────── */
  const DRAFTS_KEY = 'wm.drafts';

  const drafts = {
    all() {
      try { return JSON.parse(localStorage.getItem(DRAFTS_KEY)) || {}; }
      catch { return {}; }
    },
    get(id) {
      return this.all()[id] || null;
    },
    save(id, data) {
      const all = this.all();
      all[id] = { ...(all[id] || {}), ...data, updatedAt: Date.now() };
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(all));
      return all[id];
    },
    delete(id) {
      const all = this.all();
      delete all[id];
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(all));
    },
    list() {
      const all = this.all();
      return Object.keys(all).map(id => ({ id, ...all[id] }))
        .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    }
  };

  /* ─── AUTO-APPLY ON LOAD ──────────────────────────────── */
  function autoApply() {
    identity.apply();
    site.apply();
    presence.apply();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoApply);
  } else {
    autoApply();
  }

  /* ─── PUBLIC API ──────────────────────────────────────── */
  return {
    stories, motifs, themes,
    getStory, getStoriesByMotif, getRelatedStories,
    getParam, renderMarkdown, escapeHtml,
    identity, site, drafts,
    reader, marks, shelf, presence
  };
})();
