/* ═══════════════════════════════════════════════════════════
   KODY LÂM · BILINGUAL INTERFACE  (wm-i18n.js)
   ───────────────────────────────────────────────────────────
   Translates the INTERFACE (nav, buttons, headings, labels)
   between English and Vietnamese. Story titles, excerpts, and
   bodies are NOT touched — only strings present in the dictionary
   below are ever translated, so content is always safe.

   Usage: WM.i18n.apply('vi') or WM.i18n.apply('en')
   Persists to localStorage 'wm.lang'. Loaded on every page.
   ═══════════════════════════════════════════════════════════ */

(function () {
  // Normalize a string for matching: strip tags, collapse whitespace, lowercase
  function norm(s) {
    return (s || '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  // Dictionary: normalized English  →  Vietnamese HTML
  // (Vietnamese values may contain <em>/<br> to preserve styling.)
  const VI = {
    // ── Navigation / common ──
    'library': 'Thư viện',
    'about': 'Giới thiệu',
    'elsewhere': 'Nơi khác',
    'atelier': 'Trang chủ',
    'motifs': 'Mô-típ',
    'home': 'Trang chủ',
    'shelf': 'Kệ sách',
    'notes': 'Ghi chú',
    'influences': 'Ảnh hưởng',
    'identity': 'Con người',
    'newsletter': 'Bản tin',
    'selected work': 'Tác phẩm chọn lọc',
    'the library': 'Thư viện',

    // ── Filter chips / tabs ──
    'all': 'Tất cả',
    'fiction': 'Truyện',
    'short': 'Truyện ngắn',
    'tản văn': 'Tản văn',

    // ── Buttons / CTAs ──
    'subscribe →': 'Đăng ký →',
    'subscribe': 'Đăng ký',
    'enter the library →': 'Vào Thư viện →',
    'enter the library': 'Vào Thư viện',
    'open this piece →': 'Mở bài này →',
    'open this piece': 'Mở bài này',
    'read this piece →': 'Đọc bài này →',
    'read this piece': 'Đọc bài này',
    'read →': 'Đọc →',
    'send →': 'Gửi →',
    'get in touch': 'Liên hệ',
    'receive future letters →': 'Nhận những lá thư sau →',
    'receive future letters': 'Nhận những lá thư sau',
    'open the library': 'Mở thư viện',
    '← return to the atelier': '← Về trang chủ',
    'return to the atelier': 'Về trang chủ',
    '← back to the site': '← Về trang chủ',
    'back to the site': 'Về trang chủ',
    '← back to the library': '← Về Thư viện',
    'begin here': 'Bắt đầu ở đây',
    'full index': 'Mục lục đầy đủ',
    'read more': 'Đọc tiếp',

    // ── Reader chrome / settings ──
    'reading preferences': 'Tùy chỉnh đọc',
    'type size': 'Cỡ chữ',
    'theme': 'Giao diện',
    'width': 'Chiều rộng',
    'night': 'Đêm',
    'sepia': 'Nâu vàng',
    'narrow': 'Hẹp',
    'default': 'Mặc định',
    'wide': 'Rộng',
    'mark as read': 'Đánh dấu đã đọc',
    'save to shelf': 'Lưu vào kệ',
    'saved to shelf': 'Đã lưu vào kệ',
    'share quietly': 'Chia sẻ nhẹ nhàng',
    'leave a mark': 'Để lại dấu',
    'leave it →': 'Gửi →',
    'leave it': 'Gửi',

    // ── Index (home) eyebrows + headings ──
    'the doorway': 'Lối vào',
    'the mood': 'Không khí',
    'the archive': 'Kho lưu trữ',
    'presence': 'Hiện diện',
    'a small archive of rain, rooms, and unsent words.':
      'Một kho lưu trữ nhỏ về mưa, những căn phòng, và những lời chưa kịp gửi.',
    'rain-lit, intimate, cinematic.': 'Đẫm mưa, thân mật, đầy chất điện ảnh.',
    'one piece,one mood.': 'Một bài,<br>một không khí.',
    'one piece, one mood.': 'Một bài, một không khí.',
    'a curated shelf —each piece marked by form and feeling.':
      'Một kệ tuyển chọn —<br>mỗi bài ghi dấu bởi thể loại và cảm xúc.',
    'a literary room —intimate, visual, easy to wander.':
      'Một căn phòng văn chương —<br>thân mật, giàu hình ảnh, dễ lạc bước.',
    'a few placesto follow the work.': 'Vài nơi<br>để dõi theo tác phẩm.',
    'a few places to follow the work.': 'Vài nơi để dõi theo tác phẩm.',
    'short fiction and tản văn (lyrical essays) in english and vietnamese — built like a moody reading room, not a noisy blog.':
      'Truyện ngắn và tản văn (lyrical essays) bằng tiếng Anh và tiếng Việt — dựng như một phòng đọc trầm mặc, không phải một blog ồn ào.',

    // ── Library ──
    'two doorways': 'Hai lối vào',
    'two doorways into the archive.': 'Hai lối vào kho lưu trữ.',
    'the full archive.': 'Toàn bộ kho lưu trữ.',
    'a featured piece in each language — start with whichever weather matches your room tonight.':
      'Mỗi ngôn ngữ một bài nổi bật — bắt đầu với thời tiết hợp căn phòng của bạn tối nay.',
    'seven pieces in total — five in english, two in vietnamese. each marked by its form, motif, and quiet length.':
      'Tổng cộng bảy bài — năm tiếng Anh, hai tiếng Việt. Mỗi bài ghi dấu bởi thể loại, mô-típ và độ dài tĩnh lặng.',
    'search a title, motif, or first line…': 'Tìm tiêu đề, mô-típ, hoặc câu mở đầu…',

    // ── About ──
    'the writer · kody lâm': 'Người viết · Kody Lâm',
    "forms, motifs, and what i owethe reader.": 'Thể loại, mô-típ, và điều tôi nợ<br>người đọc.',
    "forms, motifs, and what i owe the reader.": 'Thể loại, mô-típ, và điều tôi nợ người đọc.',
    "what's nearby while i work.": 'Những gì quanh tôi khi viết.',
    'pieces that found other rooms.': 'Những bài đã tìm thấy căn phòng khác.',
    'how a piece arrives.': 'Một bài ra đời như thế nào.',

    // ── Motifs ──
    'the motifarchive': 'Kho Mô-típ',
    'the motif archive': 'Kho Mô-típ',
    'rain': 'Mưa',
    'water': 'Nước',
    'window': 'Cửa sổ',
    'silence': 'Im lặng',
    'silence · im lặng': 'Im lặng',
    'night ': 'Đêm',
    'city': 'Thành phố',
    'draft': 'Bản nháp',

    // ── 404 ──
    'this page has been torn from the book.': 'Trang này đã bị xé khỏi cuốn sách.',
    'page not found': 'Không tìm thấy trang',

    // ── Writer Hub (admin) ──
    'overview': 'Tổng quan',
    'analytics': 'Phân tích',
    'all content': 'Tất cả nội dung',
    'new piece': 'Bài mới',
    'new': 'Mới',
    'export': 'Xuất',
    'backup': 'Sao lưu',
    'backup & restore': 'Sao lưu & khôi phục',
    'download backup': 'Tải bản sao lưu',
    'all forms': 'Mọi thể loại',
    'all langs': 'Mọi ngôn ngữ',
    'reader marks': 'Dấu độc giả',
    'media library': 'Thư viện ảnh',
    'motifs & characters': 'Mô-típ & Nhân vật',
    'move to collection': 'Chuyển vào bộ sưu tập',
    'how the work is being read · gently, slowly': 'Tác phẩm đang được đọc ra sao · nhẹ nhàng, chậm rãi',
    'language split': 'Phân bổ ngôn ngữ',
    'identity · site · presence · backup': 'Danh tính · trang · hiện diện · sao lưu',
    'reads': 'Lượt đọc',
    'marks': 'Dấu',
    'archived': 'Lưu trữ',
    'published': 'Đã đăng',
    'drafts': 'Nháp',
    'scheduled': 'Đã lên lịch',
    'loading…': 'Đang tải…',
    'sign out': 'Đăng xuất',
    'save changes': 'Lưu thay đổi',
    'send reply': 'Gửi trả lời',
    'filter': 'Lọc'
  };

  // Selectors that may hold UI strings. Safety comes from the dictionary:
  // only elements whose text exactly matches a key are ever changed.
  const SELECTORS = [
    'a', 'button',
    'h1', 'h2', 'h3', 'h4',
    '.section-eyebrow', '.section-sub', '.eyebrow',
    '.hero-lead', '.cta-label', '.cta-title', '.cta-sub',
    '.feat-cta', '.tab', '.chip', '.pill',
    '.settings-label', '.settings-panel h4',
    'label', '.panel-title', '.panel-sub', '.stat-label',
    '.search-input', 'input[placeholder]', 'textarea[placeholder]'
  ].join(',');

  const WMref = window.WM || (window.WM = {});

  WMref.i18n = {
    lang: 'en',
    dict: VI,

    apply: function (lang) {
      const toVi = lang === 'vi';
      this.lang = lang;
      document.documentElement.lang = lang;

      document.querySelectorAll(SELECTORS).forEach(el => {
        // Placeholder-bearing fields translate their placeholder, not text
        if (el.hasAttribute('placeholder')) {
          if (el.dataset.i18nPh === undefined) el.dataset.i18nPh = el.getAttribute('placeholder');
          const keyP = norm(el.dataset.i18nPh);
          if (toVi && VI[keyP]) el.setAttribute('placeholder', VI[keyP].replace(/<[^>]+>/g, ''));
          else el.setAttribute('placeholder', el.dataset.i18nPh);
          return;
        }
        // Skip elements that wrap big blocks (don't nuke structure)
        if (el.children.length > 2) return;
        // Skip if any child is a block container we shouldn't flatten
        if (el.querySelector('div,ul,ol,section,article,nav,header,footer,img,svg')) return;

        const original = (el.dataset.i18nEn !== undefined) ? el.dataset.i18nEn : el.innerHTML;
        const key = norm(original);
        if (!key) return;

        if (toVi && VI[key] !== undefined) {
          if (el.dataset.i18nEn === undefined) el.dataset.i18nEn = el.innerHTML;
          el.innerHTML = VI[key];
        } else if (!toVi && el.dataset.i18nEn !== undefined) {
          el.innerHTML = el.dataset.i18nEn;
        }
      });

      // Reflect active state on any lang toggles present
      document.querySelectorAll('[data-lang]').forEach(b => {
        if (b.dataset.lang === 'en' || b.dataset.lang === 'vi')
          b.classList.toggle('active', b.dataset.lang === lang);
      });

      try { localStorage.setItem('wm.lang', lang); } catch (e) {}
    },

    init: function () {
      let saved = 'en';
      try { saved = localStorage.getItem('wm.lang') || 'en'; } catch (e) {}
      // Wire any lang toggle buttons on the page
      document.querySelectorAll('[data-lang]').forEach(btn => {
        const l = btn.dataset.lang;
        if (l !== 'en' && l !== 'vi') return;
        btn.addEventListener('click', () => WMref.i18n.apply(l));
      });
      if (saved === 'vi') this.apply('vi');
      else this.apply('en');
    }
  };

  // Auto-init once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => WMref.i18n.init());
  } else {
    WMref.i18n.init();
  }
})();

/* ═══════════════════════════════════════════════════════════
   GENTLE PAGE TRANSITIONS  (elegant cinematic fade)
   Fades the page in on load, and fades out before navigating
   to another internal page — a soft crossfade, never theatrical.
   ═══════════════════════════════════════════════════════════ */
(function () {
  // Fade in on arrival
  try {
    const st = document.createElement('style');
    st.textContent =
      '@keyframes wmFadeIn{from{opacity:0}to{opacity:1}}' +
      'body{animation:wmFadeIn .55s cubic-bezier(.2,.7,.3,1) both}' +
      'body.wm-leaving{opacity:0 !important;transition:opacity .32s cubic-bezier(.2,.7,.3,1)}';
    (document.head || document.documentElement).appendChild(st);
  } catch (e) {}

  function internalLink(a) {
    if (!a) return false;
    const href = a.getAttribute('href') || '';
    if (!href || href[0] === '#' || /^(mailto:|tel:|https?:|\/\/)/.test(href)) return false;
    if (a.target === '_blank' || a.hasAttribute('download')) return false;
    return /\.html(\?|#|$)/.test(href);
  }

  document.addEventListener('click', function (e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const a = e.target.closest ? e.target.closest('a') : null;
    if (!internalLink(a)) return;
    e.preventDefault();
    const url = a.href;
    document.body.classList.add('wm-leaving');
    setTimeout(function () { window.location.href = url; }, 300);
  }, true);

  // Restore visibility if returning via back/forward cache
  window.addEventListener('pageshow', function () {
    document.body.classList.remove('wm-leaving');
  });
})();
