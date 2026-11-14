#!/usr/bin/env node
/*  tools/share-cards.js — a proper share preview for every piece.

    Facebook, Zalo, Messenger, X, Slack… build a link's preview from the page's meta
    tags without running its scripts, so reader.html (which titles itself in JS) shares
    as a generic "Reading — Kody Lâm". For every piece in wm.js this writes:

      og/<id>.png   the 1200×630 card those services show: the piece's first line,
                    its title and the Kody mark, in the night-desk palette;
      s/<id>.html   a small page carrying that piece's title, first line and card in
                    its meta tags. A person who opens it goes straight on to
                    reader.html?id=<id> (crawlers stay and read the tags);

    and refreshes the list of shareable ids in reader.html, whose Share buttons hand
    out the s/<id>.html address.

    Run after adding or retitling a piece:     node tools/share-cards.js
    Needs Node and Playwright (npm i playwright && npx playwright install chromium).   */

const fs = require('fs'), path = require('path'), vm = require('vm');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const BASE = 'https://lamquechi.github.io/Kody';
const FORMS = {
  en: { fiction: 'Fiction', short: 'Short', 'tan-van': 'Tản văn', poem: 'Poem', essay: 'Essay', min: 'min' },
  vi: { fiction: 'Truyện', short: 'Truyện ngắn', 'tan-van': 'Tản văn', poem: 'Thơ', essay: 'Tiểu luận', min: 'phút' },
};

// ── the pieces, read straight from wm.js (a browser script: give it just enough of a window)
function loadStories() {
  const store = {};
  const ctx = {
    localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
    document: { readyState: 'complete', addEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; },
      createElement() { return { style: {}, setAttribute() {}, appendChild() {} }; }, head: { appendChild() {} }, documentElement: {} },
    addEventListener() {}, dispatchEvent() {}, CustomEvent: function () {}, console,
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'wm.js'), 'utf8'), ctx, { filename: 'wm.js' });
  return ctx.WM.stories.filter(s => s && s.id && (s.status || 'published') === 'published');
}

const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const md = s => esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+?)\*/g, '<em>$1</em>');
const plain = s => String(s).replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim();
function firstLine(s) {   // the opening paragraph, as the reader shows it
  for (const p of String(s.body || '').replace(/\r/g, '').split(/\n\s*\n/)) {
    const t = p.trim();
    if (t && !/^(#{1,6}\s|>)/.test(t)) return t.replace(/\s+/g, ' ');
  }
  return s.excerpt || s.title;
}
function label(s) {
  const L = FORMS[s.lang === 'vi' ? 'vi' : 'en'];
  return ['Folio ' + (s.folio || ''), L[s.form] || s.form || '', (s.readTime || '') + ' ' + L.min].filter(Boolean).join(' · ');
}

function cardHTML(s) {
  return `<!doctype html><html lang="${s.lang === 'vi' ? 'vi' : 'en'}"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:ital,wght@1,700&family=Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,300;1,9..144,400&family=JetBrains+Mono:wght@500&display=block" rel="stylesheet">
<style>
  *{margin:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:#13110D;color:#ECE6D8;position:relative;overflow:hidden;-webkit-font-smoothing:antialiased}
  body::before{content:"";position:absolute;inset:0;background:radial-gradient(900px 520px at 16% -12%,rgba(201,162,75,.11),transparent 62%)}
  .frame{position:absolute;inset:34px;border:1px solid rgba(201,162,75,.24)}
  .k{position:absolute;left:92px;top:84px;font:500 16px/1 "JetBrains Mono",monospace;letter-spacing:.26em;text-transform:uppercase;color:#E5784E}
  .q{position:absolute;left:92px;right:120px;top:138px;font-family:Fraunces,serif;font-style:italic;font-weight:300;line-height:1.22;letter-spacing:-.005em}
  .q em{color:#E5784E}
  .q::before{content:"\\201C";position:absolute;left:-.52em;top:-.02em;font-style:normal;font-weight:400;color:#C9A24B}
  .foot{position:absolute;left:92px;right:92px;bottom:78px;display:flex;align-items:flex-end;justify-content:space-between;gap:40px}
  .t{font:500 34px/1.12 Fraunces,serif;color:#ECE6D8;max-width:760px}
  .by{margin-top:10px;font:italic 400 21px/1 Fraunces,serif;color:#A6A595}
  .mk{position:relative;font:italic 700 46px/1 "Libre Caslon Text",serif;color:#ECE6D8;padding-bottom:.69em;flex:0 0 auto}
  .mk svg{position:absolute;left:8%;bottom:.44em;width:68%;height:.21em;overflow:visible}
  .mk path{fill:none;stroke:#C9A24B;stroke-width:1.6;stroke-linecap:round;vector-effect:non-scaling-stroke}
</style></head><body>
<div class="frame"></div>
<div class="k">${esc(label(s))}</div>
<div class="q" id="q">${md(firstLine(s))}</div>
<div class="foot"><div><div class="t">${esc(s.title)}</div><div class="by">Kody Lâm</div></div>
<div class="mk">Kody<svg viewBox="36 135 215 28" preserveAspectRatio="none"><path d="M250,152 C158,170 64,162 40,146 C28,138 44,132 60,138"/></svg></div></div>
</body></html>`;
}

function sharePage(s) {
  const lang = s.lang === 'vi' ? 'vi' : 'en';
  const title = `${s.title} — Kody Lâm`;
  const line = plain(firstLine(s));
  const desc = line.length > 190 ? line.slice(0, 187).replace(/\s+\S*$/, '') + '…' : line;
  const read = `../reader.html?id=${encodeURIComponent(s.id)}`;
  const url = `${BASE}/s/${encodeURIComponent(s.id)}.html`, img = `${BASE}/og/${encodeURIComponent(s.id)}.png`;
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="${BASE}/reader.html?id=${encodeURIComponent(s.id)}">
<link rel="icon" type="image/svg+xml" href="../favicon.svg?v=13">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Kody Lâm">
<meta property="og:locale" content="${lang === 'vi' ? 'vi_VN' : 'en_US'}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="“${esc(desc)}”">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="“${esc(desc)}” — ${esc(s.title)}, Kody Lâm">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="“${esc(desc)}”">
<meta name="twitter:image" content="${img}">
<script>location.replace(${JSON.stringify(read)} + location.hash);</script>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#F7F2E8;color:#1A1510;font-family:Georgia,serif;padding:24px}
main{max-width:560px}p{font-style:italic;font-size:22px;line-height:1.5;margin:0 0 18px}a{color:#A33B2B;font-family:monospace;letter-spacing:.12em;text-transform:uppercase;font-size:13px}</style>
</head>
<body><main><p lang="${lang}">“${md(firstLine(s))}”</p><a href="${read}">${esc(s.title)} — ${lang === 'vi' ? 'đọc tiếp' : 'keep reading'} →</a></main></body>
</html>
`;
}

(async () => {
  const stories = loadStories();
  fs.mkdirSync(path.join(ROOT, 'og'), { recursive: true });
  fs.mkdirSync(path.join(ROOT, 's'), { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const s of stories) {
    await page.setContent(cardHTML(s), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    // the first line is the card: as large as it can be while it still fits above the title
    await page.evaluate(() => {
      const q = document.getElementById('q'), limit = document.querySelector('.foot').getBoundingClientRect().top - 36;
      for (let px = 60; px >= 30; px -= 2) { q.style.fontSize = px + 'px'; if (q.getBoundingClientRect().bottom <= limit) break; }
    });
    await page.screenshot({ path: path.join(ROOT, 'og', s.id + '.png') });
    fs.writeFileSync(path.join(ROOT, 's', s.id + '.html'), sharePage(s));
    console.log('card + share page:', s.id);
  }
  await browser.close();
  // the reader hands out s/<id>.html for these
  const reader = path.join(ROOT, 'reader.html');
  const src = fs.readFileSync(reader, 'utf8');
  const list = '/*share-pages*/' + JSON.stringify(stories.map(s => s.id)) + '/*/share-pages*/';
  const next = src.replace(/\/\*share-pages\*\/[\s\S]*?\/\*\/share-pages\*\//, list);
  if (next === src && !src.includes(list)) throw new Error('reader.html: share-pages marker not found');
  fs.writeFileSync(reader, next);
  console.log(`${stories.length} pieces; reader.html share list updated`);
})();
