# Kody Lâm — Design & Architecture

A reference for anyone maintaining this site. It documents the brand kit, the
shared systems (theme, bilingual, data), and the conventions the pages rely on.
The stack is deliberately plain: hand-written HTML/CSS/JS, **no build step**, CSS
inline per page, shared behaviour in a few `wm-*.js` files loaded on every page.

---

## 1. Brand kit

### Colours (CSS custom properties, defined per page in `:root` and `body.dark`)

| Token | Light (paper) | Dark (ink) | Use |
|---|---|---|---|
| `--paper` | `#F7F2E8` | `#0F1115` | page background |
| `--paper-2/-3` | `#EFE7D6` / `#E7DDC8` | `#16191E` / `#1E222A` | raised surfaces |
| `--ink` | `#1A1510` | `#ECE6D8` | primary text |
| `--ink-soft` | `#5E5345` | `#A6A595` | secondary text (**use this, not faint, for anything meant to be read**) |
| `--ink-faint` | `#897A60` | `#83857B` | truly incidental labels only |
| `--scarlet` | `#B8472E` | `#E5784E` | accent (links, hovers) |
| `--swash` | `#A33B2B` (son) | `#C9A24B` (gold) | the wordmark flourish — son on paper, gold on ink |
| `--green` / `--blue` | `#3A6B5C` / `#43677A` | `#7BAA95` / `#85ABC2` | secondary accents (VI = blue) |

The **reader** uses its own per-mode tokens (`--text`, `--muted`, `--faint`,
`--accent`, `--swash`) for day / sepia / night — same idea, different names.

### Type
- `--disp` = **Fraunces** — display only: big headlines, titles, drop caps, pull-quotes, signatures. Turns hairline-thin at small sizes, so **never use it for reading-size body/italic text.**
- `--body` = **Spectral** — all reading text, including italic excerpts/ledes. Legible italic.
- `--mono` = **JetBrains Mono** — eyebrows, labels, meta. Keep uppercase tracking modest (~.12–.16em); wide tracking on long caps strings hurts readability.
- Wordmark = **Libre Caslon Text**, italic 700, *only* for the "Kody" logo.

### The wordmark ("Kody" + swash)
Rendered as HTML text + a positioned SVG swash so it themes with CSS:

```html
<a class="mk">Kody<svg class="mksw" viewBox="36 135 215 28" preserveAspectRatio="none"><path d="M250,152 C158,170 64,162 40,146 C28,138 44,132 60,138"/></svg></a>
```
```css
.mk{position:relative;display:inline-block;font-family:"Libre Caslon Text",serif;font-style:italic;font-weight:700;color:var(--ink);padding-bottom:0.69em}
.mk .mksw{position:absolute;left:8%;bottom:0.44em;width:68%;height:0.21em;overflow:visible}
.mk .mksw path{fill:none;stroke:var(--swash);stroke-width:1.3;stroke-linecap:round;vector-effect:non-scaling-stroke}
```
- The path and viewBox are the **logo kit's actual flourish** — do not substitute a hand-drawn one (it distorts).
- `non-scaling-stroke` keeps the line a constant ~1.3px at every size. All values are `em`/`%` so one rule works for every wordmark size (spine 19px, mobile 21, login 22, reader stamp 26).
- Source of truth for the kit (avatars, colophon, on-ink variants): the `Kody-final` logo kit; `og-image.png` and `favicon.svg` follow it.

---

## 2. Theme system (`wm-theme.js`)
- One choice, `localStorage['wm.theme']` ∈ `{light, dark}`, honoured on every page.
- A tiny inline no-FOUC snippet right after `<body>` sets `body.dark` before first paint (atelier pages) — keep it.
- Every page defines the full palette twice: `:root` (light) and `body.dark`. When adding a colour, add it to **both**.

---

## 3. Bilingual EN ↔ VI (`wm-i18n.js`)
- One choice, `localStorage['wm.lang']` ∈ `{en, vi}`, applied on every page.
- **Static markup** is translated by matching an element's exact text against the `VI` dictionary (only listed strings ever change — content is safe).
- **JS-generated strings** must go through `WM.i18n.t('English string')`, which returns the VI value (tags stripped) or the English fallback. Pages that build DOM in JS (index list, library rows, reader title/chip/tray) listen for the **`wm:lang`** event and re-render.
- **To add a translation:** add `'normalized english': 'Tiếng Việt'` to `VI` in `wm-i18n.js` (key = lowercased, tags/space-collapsed). If the string is JS-generated, wrap it in `t()`; if it carries a decorative child (e.g. a coloured dot span), include that markup in the VI value.
- Bump `wm-i18n.js?v=` on every page when the file changes (see §6).

---

## 4. Data & backend
- `WM.stories` (in `wm.js`) is the canonical piece list; `wm-supabase.js` **pushes published pieces onto it** on `wm:ready`, so it grows over time.
- Author-local planning/status lives in `WM.pieceMeta` (localStorage); it syncs to Supabase when signed in.
- **Reader status:** a piece is "to be continued" when `story.continued` (published) or `pieceMeta.get(id).continued` (author) is true. Shown as a chip on the reader opening, a badge on browse cards, and set via the editor's "Reader status" control.
- **Chapters:** `## ` starts a chapter (Roman-numbered, builds a Contents list; a passage before the first `##` counts as Chapter I); `### ` is a section. The editor's live Contents mirrors the reader's numbering exactly.
- **Supabase security:** run all of `supabase-setup.sql` (incl. the SECURITY HARDENING block) in the SQL editor. It enables RLS on every table, makes the first signup admin, forbids self-promotion to admin, keeps emails/marks private. Config ships the **anon** key only (safe; RLS is the guard) — never the service_role key.

---

## 5. UX conventions
- **Never let a list sprawl.** Front page (index) shows at most **6** pieces; the library archive pages **10 at a time** with "Show more" (filters apply to the full set, then a page of matches is shown); each motif shows at most **6** cards with a "more in the archive" link. Counts shown are always the true total.
- **Reveal on scroll:** elements get `class="reveal"` (starts hidden) and an IntersectionObserver adds `.in`. Honour `prefers-reduced-motion` (fall back to showing everything).
- **Performance:** internal links fade out 150ms then navigate, and prefetch on hover/touch (`wm-i18n.js`). Any `requestAnimationFrame` follow loop (e.g. the cursor ring) must move with `transform` (not `left/top`) and **park itself when settled** — never leave a rAF running idle.
- **Accessibility:** icon-only buttons need `aria-label`; images need `alt`; every page includes the shared `:focus-visible` outline rule. Reader supports ←/→/Esc.

---

## 6. Cache-busting (important)
Shared scripts are referenced with `?v=N`. **When you edit a `wm-*.js` file, bump its `?v=` on every page that loads it**, or returning visitors keep the cached copy. Current: `wm.js` v8, `wm-config.js` v8, `wm-supabase.js` v9, `wm-i18n.js` v9, `wm-theme.js` v3, `favicon.svg` v13. (Inline page CSS/JS needs no bump — it ships with the HTML.)

---

## 7. Where things live
```
index / library / reader / about / motifs / shelf / 404   ← public pages (self-contained HTML+CSS+JS)
login / hub / editor                                       ← private studio (noindex)
beta / manifesto                                           ← orphan drafts (not linked publicly)
wm-config.js   Supabase keys + optional admin lock
wm.js          WM core: stories data, motifs, drafts, marks, seo, helpers
wm-supabase.js backend: auth, pieces, marks, subscribers, sync
wm-i18n.js     EN↔VI + page-transition/prefetch
wm-theme.js    light/dark engine
supabase-setup.sql   run once in Supabase (schema + RLS + hardening)
og-image.png / favicon.svg   brand assets (regen from the kit)
README / SETUP / SEO-GUIDE / DESIGN   docs
```

Golden rule: keep it plain, keep it quiet. This is a reading room, not an app.
