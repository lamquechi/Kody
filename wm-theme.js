/*  wm-theme.js — one light/dark control for the whole site.

    Single source of truth:  localStorage['wm.theme'] = 'light' | 'dark'
    (legacy 'wm.reader.mode' is read for back-compat and kept in sync).

    Each page declares its world on <html data-world="atelier|velvet">:
      atelier  →  default LIGHT;  <body class="dark">        expresses dark
      velvet   →  default DARK;   <body class="light-mode">  expresses light
    So one stored choice maps to whichever class each world already styles.
    The reader's per-story variant-* / theme-sepia classes are independent and
    left untouched.

    A tiny inline snippet in each <body> applies the class before first paint
    (no flash); this file re-affirms it, swaps the icon, and wires the toggles. */
(function () {
  var KEY = 'wm.theme', LEGACY = 'wm.reader.mode';
  var SUN  = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.2" y1="4.2" x2="5.6" y2="5.6"/><line x1="18.4" y1="18.4" x2="19.8" y2="19.8"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.2" y1="19.8" x2="5.6" y2="18.4"/><line x1="18.4" y1="5.6" x2="19.8" y2="4.2"/>';
  var MOON = '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>';

  function velvet() { return document.documentElement.getAttribute('data-world') === 'velvet'; }
  function native() { return velvet() ? 'dark' : 'light'; }           // each world's designed default
  function stored() {
    try {
      var v = localStorage.getItem(KEY);
      if (v === 'light' || v === 'dark') return v;
      var l = localStorage.getItem(LEGACY);
      if (l === 'light' || l === 'dark') return l;
    } catch (e) {}
    return null;
  }
  function resolve() { return stored() || native(); }

  function updateIcon(mode) {
    var inner = (mode === 'light') ? MOON : SUN;        // show the mode the user will switch TO
    var ic = document.getElementById('modeIcon');       // library / motifs: inner of a styled <svg>
    if (ic) { ic.innerHTML = inner; return; }
    var b = document.getElementById('modeBtn');          // reader: button holds the whole <svg>
    if (b && !b.querySelector('.theme-icon-sun')) b.innerHTML = '<svg viewBox="0 0 24 24">' + inner + '</svg>';
  }
  function apply(mode) {
    var b = document.body; if (!b) return;
    if (velvet()) { b.classList.toggle('light-mode', mode === 'light'); b.classList.remove('dark'); }
    else          { b.classList.toggle('dark',        mode === 'dark');  b.classList.remove('light-mode'); }
    b.setAttribute('data-mode', mode);
    updateIcon(mode);
    var btns = document.querySelectorAll('#themeToggle, #modeBtn, [data-theme-toggle]');
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', mode === 'dark' ? 'true' : 'false');
  }
  function current() {
    return velvet() ? (document.body.classList.contains('light-mode') ? 'light' : 'dark')
                    : (document.body.classList.contains('dark') ? 'dark' : 'light');
  }
  function set(mode) {
    try { localStorage.setItem(KEY, mode); localStorage.setItem(LEGACY, mode); } catch (e) {}
    apply(mode);
  }
  function toggle() { set(current() === 'dark' ? 'light' : 'dark'); }

  window.WMTheme = { resolve: resolve, apply: apply, set: set, toggle: toggle, current: current };

  function init() {
    apply(resolve());
    var btns = document.querySelectorAll('#themeToggle, #modeBtn, [data-theme-toggle]');
    for (var i = 0; i < btns.length; i++) {
      (function (el) {
        if (el.getAttribute('data-wm-bound')) return;
        el.setAttribute('data-wm-bound', '1');
        el.addEventListener('click', function (e) { e.preventDefault(); toggle(); });
      })(btns[i]);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
