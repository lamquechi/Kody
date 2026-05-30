# Kody Lâm

A bilingual literary portfolio and reading platform — built as a quiet, atmospheric reading room rather than a noisy blog.

**Stack:** Plain HTML, CSS, JS. No build step. No backend. All state via browser `localStorage`.

---

## Deploy to GitHub Pages — 5 minutes

1. **Create a new GitHub repository** (public).
2. **Upload every file in this folder** to repository root (drag-and-drop on github.com works).
3. **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / `/ (root)` → Save.
4. **Wait 30–60 seconds** → visit `https://<username>.github.io/<repo-name>/`.

No build, no Jekyll, no Node — files served as-is.

> ⚠ Upload contents OF the `publish/` folder, not the folder itself. `index.html` must be at repo root.

---

## First-run setup (do this once)

1. Visit `/hub.html`
2. **Settings** (sidebar, last item) → tab **Identity**
3. Fill: pen name, call name, tagline, bio → **Save changes**

Your name now appears across About, the user chip, greetings, author bylines. Persisted in `localStorage`.

Long-term safety: **Settings → Backup → Download backup**. Save the JSON. Restore on new device via same panel.

---

## Pages

| URL | What |
|---|---|
| `/` | Home (Atelier · light) |
| `/library.html` | Library — 8 pieces, search/filter/sort |
| `/reader.html?id=<id>` | Reader with chrome, settings, drop-cap |
| `/about.html` | About the writer · bio · influences · process |
| `/motifs.html` | Motif archive — pieces grouped by theme |
| `/hub.html` | Writer Hub dashboard *(yours)* |
| `/editor.html` | Editor — markdown + live preview + auto-save *(yours)* |
| `/manifesto.html` | Design system reference |
| `/404.html` | Custom on-brand 404 |

**Story IDs:** `the-city-after-rain` · `letters-to-the-reservoir` · `in-a-room-of-small-lights` · `mirror-city-notes` · `the-language-of-unfinished-things` · `saigon-after-eleven` · `mot-nua-cua-im-lang` · `a-door-at-three-am` (interactive)

---

## Features (verified working)

### For readers
- **Reader prefs persist** across stories — font size, theme, width remembered
- **Leave a small mark** — anonymous notes saved locally, appear in your Hub Inbox
- **Bookmark / shelf** — toggle on any piece
- **Interactive pieces** — `form: 'interactive'` stories show choice buttons branching through scenes
- **Per-story theme variants** — Velvet, Mercury (blue), Amber (warm), Moss (green)

### For you (the writer)
- **Identity** — set name once, propagates everywhere
- **Site config** — customize site name, mark, tagline via Hub Settings
- **Editor auto-save** — every keystroke saved after 800ms
- **Hub Content** — table reads `WM.stories` + your drafts; click row → Reader/Editor
- **Hub Inbox** — reads real reader marks; click to mark as read
- **Backup / Restore** — export identity as JSON

---

## Adding a new piece

Open `wm.js`. Add to `const stories = [...]`:

### Prose story
```js
{
  id: 'a-quiet-room',
  folio: 'IX',
  title: 'A Quiet Room',
  titleHTML: 'A <em>Quiet</em><br>Room',
  lang: 'en',                  // 'en' or 'vi'
  form: 'tan-van',             // 'fiction' | 'tan-van' | 'short' | 'interactive'
  motif: 'silence',
  readTime: 4,
  status: 'published',
  publishedAt: '2026-06-01',
  reads: 0,
  marks: 0,
  description: 'one-line for cards',
  excerpt: 'opening sentence',
  themeVariant: 'velvet',      // optional: 'velvet' | 'mercury' | 'amber' | 'moss'
  body: `Markdown.

> Pull quote.

Use **bold**, *italic*, [link](url).`
}
```

### Interactive piece
Replace `body` with `scenes`:

```js
{
  id: 'the-river-fork',
  form: 'interactive',
  themeVariant: 'mercury',
  // ...other metadata same as above...
  scenes: {
    start: {
      body: `Opening markdown.

You see two paths.`,
      choices: [
        { label: 'Take left.',  next: 'left'  },
        { label: 'Take right.', next: 'right' }
      ]
    },
    left: {
      body: `Left path content.`,
      ending: 'ENDING · THE LEFT BANK'
    },
    right: {
      body: `Right path content.`,
      choices: [
        { label: 'Cross back.', next: 'left' },
        { label: 'Continue.',   next: 'continued' }
      ]
    },
    continued: {
      body: `River opens wider.`,
      ending: 'ENDING · THE WIDE WATER'
    }
  }
}
```

Each scene has `body` (markdown) + either `choices` (array `{label, next}`) or `ending` (label).

After adding, piece auto-appears via `?id=` URL and in Continue-reading. Manually add a card in `library.html` index or `motifs.html` motif section for discoverability.

---

## Adding a motif

```js
WM.motifs.morning = {
  name: 'Morning',
  color: '#E8B66E',
  subtitle: 'first light · the act of beginning'
}
```

Stories with `motif: 'morning'` group under it.

---

## Customizing appearance

Hub → Settings → Site:
- **Site name** — replaces "Kody Lâm" in nav and `<title>` when customized
- **Brand mark** — letter in square logo (default: "W")
- **Site tagline** — Home hero subtitle
- **Footer line** — bottom of public pages

Defaults stay untouched until you customize (preserves stylized italic & in default brand).

---

## File structure

```
publish/
├── index.html         Home (Atelier)
├── library.html       Library (Velvet)
├── reader.html        Reader (Velvet, per-story themeable)
├── about.html         About (Atelier)
├── motifs.html        Motif Archive (Velvet)
├── hub.html           Writer Hub (Atelier)
├── editor.html        Editor (Atelier, focused)
├── manifesto.html     Design system reference
├── 404.html           Custom 404 (Velvet)
├── wm.js              Shared data + utilities (REQUIRED)
├── .nojekyll          Skip Jekyll processing
└── README.md          This file
```

**Two worlds:**
- **Atelier** (cream, ink, persimmon) — public discovery + workspace
- **Velvet** (night, gold, oxblood) — reading + intimacy
- Theatrical red curtain transitions between them

---

## wm.js API surface

```js
WM.stories                    // all pieces
WM.motifs                     // { id: {name, color, subtitle} }
WM.themes                     // { velvet, mercury, amber, moss }

WM.getStory(id)               // → story or null
WM.getStoriesByMotif(motif)   // → array
WM.getRelatedStories(id, n)   // → array (smart-sorted)
WM.getParam(name)             // → URL ?name=
WM.renderMarkdown(src)        // → HTML
WM.escapeHtml(s)

WM.identity.{get,set,clear,apply}()    // 'wm.identity'
WM.site.{get,set,clear,apply}()        // 'wm.site'
WM.drafts.{all,get,save,delete,list}() // 'wm.drafts'
WM.reader.{get,set}()                  // 'wm.reader.prefs'
WM.marks.{all,add,markRead,forStory,unreadCount,clear}()  // 'wm.marks'
WM.shelf.{all,toggle,has}()            // 'wm.shelf'
```

---

## Mockup vs functional

| | Status | Upgrade path |
|---|---|---|
| Identity propagation | ✓ Real | — |
| Site customization | ✓ Real | — |
| Editor draft auto-save | ✓ Real | — |
| Reader prefs persist | ✓ Real | — |
| "Leave a mark" → save → Inbox | ✓ Real (same-browser) | Backend for cross-device |
| Bookmark / shelf | ✓ Real | — |
| Interactive scenes | ✓ Real | — |
| Theme variants | ✓ Real | — |
| Hub Content from WM data | ✓ Real | — |
| Newsletter signup | UI only | Buttondown · Substack |
| Beta-reader invites | UI only | Resend · email service |
| Cover image upload | UI only | Cloudinary · Uploadcare |
| Real analytics | Fake numbers | Plausible · Umami |
| Cross-device identity sync | localStorage only | Backend · GitHub Gist |

---

## License

Yours. Use, fork, adapt freely.

*Quiet reading is a kind of weather. Welcome it in.*
