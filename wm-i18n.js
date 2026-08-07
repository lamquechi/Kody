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
    'motif': 'Mô-típ',
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
    'day': 'Ngày',
    '←library': '<span class="arrow">←</span>Thư viện',
    '‹ prev': '‹ Trước',
    'next ›': 'Sau ›',
    // reader toolbar + selection bar (icon-prefixed labels)
    '✎ mark': '✎ Ghi dấu',
    '♡ save': '♡ Lưu',
    '♥ saved': '♥ Đã lưu',
    '♡ save to shelf': '♡ Lưu vào kệ',
    '↗ share': '↗ Chia sẻ',
    '✎ keep': '✎ Giữ',
    '⧉ copy': '⧉ Chép',
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
    // index hero — explicit-key (data-i18n) so the headline keeps its swash SVG
    'a small archive of rain, rooms, and unsent words':
      '<span class="l">Một kho lưu trữ nhỏ</span> <span class="l">về mưa, những căn phòng,</span> <span class="l">và những lời <span class="ink">chưa gửi<svg class="uline" viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M5,9 C48,3 104,12 150,6 S196,4 196,8"/></svg></span></span>',
    'folio i · a bilingual commonplace · mmxxvi': 'Folio I · sổ tay song ngữ · MMXXVI',
    'short fiction and tản văn about water, memory, rooms — and the quiet hours people carry through the city.':
      'Truyện ngắn và tản văn về nước, ký ức, những căn phòng — và những giờ lặng người ta mang theo qua thành phố.',
    '— for the readers who linger past the second paragraph.':
      '— dành cho những người đọc còn nán lại sau đoạn thứ hai.',
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
    'a curated shelf — each piece marked by form, motif, and quiet length. letters meant to be read slowly, ideally past midnight.':
      'Một kệ sách tuyển chọn — mỗi bài ghi dấu bởi thể loại, mô-típ và độ dài tĩnh lặng. Những lá thư nên đọc chậm, lý tưởng nhất là sau nửa đêm.',
    '♡ saved': '♡ Đã lưu',
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
    'filter': 'Lọc',

    // ── Index · the front list + newsletter + footer ──
    'the index': 'Mục lục',
    'the index · latest work': 'Mục lục · tác phẩm mới',
    'piece': 'bài', 'pieces': 'bài',
    'enter the full archive': 'Vào kho lưu trữ đầy đủ',
    'enter the full archive ↗': 'Vào kho lưu trữ đầy đủ ↗',
    "each one a room of its own — choose the one that's lit for you tonight.":
      'Mỗi bài là một <em>căn phòng</em> riêng — chọn căn phòng đang sáng đèn cho bạn đêm nay.',
    'the first piece is finding its words — open the archive meanwhile.':
      'Bài đầu tiên đang tìm lời — trong lúc đó, <a href="library.html">mở kho lưu trữ</a>.',
    "a letter, only when there's something worth sending.":
      'Một lá thư, chỉ khi có <em>điều gì</em> đáng gửi.',
    'no schedule, no noise — just a note when a new piece is ready, perhaps once a month. leave anytime.':
      'Không lịch trình, không ồn ào — chỉ một dòng nhắn khi có bài mới, có lẽ mỗi tháng một lần. Rời đi lúc nào cũng được.',
    'once a month at most · unsubscribe anytime · no spam.':
      'Nhiều nhất mỗi tháng một lá · hủy lúc nào cũng được · không spam.',
    'the quiet letter · gửi bạn đọc': 'Lá thư tĩnh lặng · gửi bạn đọc',
    'rain · rooms · unsent words': 'mưa · những căn phòng · những lời chưa gửi',
    'set in fraunces & spectral': 'Chữ Fraunces &amp; Spectral',
    'set in fraunces &amp; spectral': 'Chữ Fraunces &amp; Spectral',
    'a bilingual commonplace · mmxxvi': 'Sổ tay song ngữ · MMXXVI',
    '✎ studio': '✎ Xưởng viết',
    'start here →': 'Bắt đầu ở đây →',

    // ── Status / resume / tray ──
    'complete': 'Hoàn thành',
    'to be continued': 'Còn tiếp',
    '⋯ to be continued': '⋯ Còn tiếp',
    'resumed where you left off': 'Đã mở lại đúng chỗ bạn đang đọc',
    'read next': 'Đọc tiếp theo',
    'while you wait': 'Trong lúc chờ',
    'more in': 'Thêm về',
    'the next part is on its way — read another while you wait':
      'phần tiếp theo đang trên đường tới — đọc bài khác trong lúc chờ nhé',
    'turn with the edges, arrows, or a swipe': 'lật bằng mép trang, phím mũi tên, hoặc vuốt nhẹ',
    '☰ contents': '☰ Mục lục',
    'contents': 'Mục lục',

    // ── Library controls ──
    'saved': 'Đã lưu',
    'interactive': 'Tương tác',
    'featured · begin here': '<span class="dot"></span> Nổi bật · bắt đầu ở đây',
    'show more': 'Xem thêm',
    'more piece': 'bài nữa', 'more pieces': 'bài nữa',
    'no pieces match. try another word, or clear the filters.':
      'Không có bài nào khớp. Thử một từ khác, hoặc xóa bộ lọc.',
    'in english': 'tiếng Anh', 'in vietnamese': 'tiếng Việt',
    'read like a book': 'đọc như một cuốn <b>sách</b>',
    'more in the archive': 'bài nữa trong kho lưu trữ',

    // ── Motifs ──
    '— a museum of weathers · mmxxvi': '— Bảo tàng của những kiểu thời tiết · MMXXVI',
    '"not a museum of objects, but of weathers — the recurring temperatures a writer keeps returning to, sometimes for years, without quite knowing why."':
      '"Không phải bảo tàng của đồ vật, mà của những kiểu thời tiết — những nhiệt độ người viết cứ quay về, đôi khi nhiều năm, mà không hẳn hiểu vì sao."',
    'the archive grows by weather,not by schedule.':
      'Kho lưu trữ lớn lên theo <em>thời tiết</em>,<br>không theo lịch trình.',
    'a new motif appears only when a piece truly needs one. new pieces find their motif on the way out, never before.':
      'Một mô-típ mới chỉ hiện ra khi một bài thật sự cần đến. Bài mới tìm thấy mô-típ của mình lúc rời đi, không bao giờ trước đó.',

    // ── Shelf ──
    'your shelf': 'Kệ <em>của bạn</em>',
    '— kept for later · saved on this device': '— Để dành đọc sau · lưu trên thiết bị này',
    'the pieces you pressed save on while reading — gathered here, waiting for a quieter hour.':
      'Những bài bạn nhấn <em>lưu</em> khi đang đọc — tụ lại đây, chờ một giờ tĩnh lặng hơn.',
    'your shelf is empty.': 'Kệ của bạn đang <em>trống</em>.',
    'while reading, press ♡ save in the top bar and the piece will wait for you here.':
      'Khi đọc, nhấn <em>♡ Lưu</em> ở thanh trên cùng, bài sẽ chờ bạn ở đây.',
    'browse the library →': 'Xem thư viện →',

    // ── 404 ──
    'a missing folio': 'Một trang thất lạc',
    'this page has been torn from the book.': 'Trang này đã bị <em>xé khỏi cuốn sách</em>.',
    "maybe it was a draft that left before its time. maybe the link came from a future version that hasn't been written yet. either way, the rest of the library is still here.":
      'Có lẽ đó là một bản nháp rời đi trước thời của nó. Có lẽ đường dẫn đến từ một phiên bản tương lai chưa được viết ra. Dù sao, phần còn lại của thư viện vẫn ở đây.',
    '← return home': '← Về trang chủ',
    'browse motifs': 'Xem mô-típ',

    // ── About page ──
    [`the writer · kody lâm`]: `Người viết · Kody Lâm`,
    [`a quiet writer of rain, rooms, and unsent words.`]: `một người viết lặng lẽ về mưa, những căn phòng, và những lời chưa gửi.`,
    [`bilingual · en / vi`]: `Song ngữ · EN / VI`,
    [`saigon / elsewhere`]: `Sài Gòn / nơi khác`,
    [`working since 2022`]: `Viết từ 2022`,
    [`folio · the writer`]: `Folio · người viết`,
    [`"i write in english and vietnamese about water, memory, rooms, and the quiet weather people carry through the city."`]: `"Tôi viết bằng tiếng Anh và tiếng Việt về nước, ký ức, những căn phòng, và thứ thời tiết lặng lẽ người ta mang theo qua thành phố."`,
    [`— a self-portrait, in one line —`]: `— một chân dung tự họa, trong một dòng —`,
    [`01 · in the room`]: `01 · Trong phòng`,
    [`what's nearby while i work.`]: `Những gì ở gần <em>khi tôi làm việc</em>.`,
    [`a book that returns`]: `Cuốn sách luôn trở lại`,
    [`"i read it once a year. it teaches me that thinking in fragments is not the absence of structure — it's a different one."`]: `"Mỗi năm tôi đọc nó một lần. Nó dạy tôi rằng nghĩ bằng những mảnh vụn không phải là thiếu vắng cấu trúc — mà là một cấu trúc khác."`,
    [`a song on repeat`]: `Bài hát nghe đi nghe lại`,
    [`"eight minutes that make a room slow down. i write to it more often than i should admit."`]: `"Tám phút khiến cả căn phòng chậm lại. Tôi viết cùng nó thường xuyên hơn mức tôi dám thừa nhận."`,
    [`an object on the desk`]: `Một vật trên bàn`,
    [`a small ceramic cup, chipped`]: `Một chiếc tách gốm nhỏ, <em>sứt mẻ</em>`,
    [`"bought in hội an, used badly, broken once, glued back. some afternoons it is the only thing keeping me here."`]: `"Mua ở Hội An, dùng vụng về, vỡ một lần, gắn lại. Có những buổi chiều nó là thứ duy nhất giữ tôi ở lại."`,
    [`02 · elsewhere`]: `02 · Nơi khác`,
    [`pieces that found other rooms.`]: `Những bài đã tìm được <em>căn phòng khác</em>.`,
    [`03 · process — how a piece arrives`]: `03 · Quá trình — một bài đến như thế nào`,
    [`most of my pieces begin as a temperature, not a sentence. a weather i cannot quite name — light leaving the room, an unsent message, the third hour after rain. i keep a small notebook and try to write down the temperature before i lose it.`]: `Hầu hết các bài của tôi bắt đầu như <strong>một nhiệt độ</strong>, không phải một câu chữ. Một kiểu thời tiết tôi không gọi được tên — ánh sáng rời khỏi phòng, một tin nhắn chưa gửi, giờ thứ ba sau cơn mưa. Tôi giữ một cuốn sổ nhỏ và cố ghi lại nhiệt độ ấy trước khi đánh mất nó.`,
    [`sometimes a piece sits in that notebook for months. sometimes it leaves before i can return to it. i have stopped feeling guilty about either.`]: `Có bài nằm trong cuốn sổ ấy hàng tháng trời. Có bài rời đi trước khi tôi kịp quay lại. <em>Tôi đã thôi thấy có lỗi với bất kỳ điều nào.</em>`,
    [`"not every unfinished thing is a failure. some are rooms we were not ready to enter."`]: `"Không phải điều dang dở nào cũng là một thất bại. Có những điều là căn phòng ta chưa sẵn sàng bước vào."`,
    [`the drafts are slow. i write in english when i want distance, in vietnamese when i cannot avoid the heat of something. some afternoons the language chooses me before i sit down. i trust this more than i used to.`]: `Những bản nháp đến chậm. Tôi viết tiếng Anh khi muốn giữ khoảng cách, viết tiếng Việt khi không thể tránh khỏi sức nóng của một điều gì đó. Có những buổi chiều ngôn ngữ chọn tôi trước cả khi tôi ngồi xuống. Tôi tin điều đó hơn trước kia.`,
    [`the website you are inside of now is part of the practice, not separate from it. a reading room i built so the work would have somewhere quiet to live. i update it the way one rearranges a small apartment — not often, but with care.`]: `Trang web bạn đang ở trong lúc này là một phần của việc viết, không tách rời khỏi nó. Một phòng đọc tôi dựng nên để tác phẩm có một nơi yên tĩnh mà sống. Tôi chỉnh sửa nó theo cách người ta sắp xếp lại một căn hộ nhỏ — <em>không thường xuyên, nhưng cẩn thận</em>.`,
    [`if you ever read something here that stays with you, i would like to know. a small mark is enough.`]: `Nếu có khi nào bạn đọc được điều gì đó ở đây mà nó ở lại với bạn, tôi muốn được biết. <strong>Một dấu nhỏ là đủ.</strong>`,
    [`for a quiet letter,or a translation, or a beta read.`]: `Cho một lá thư <em>lặng lẽ</em>,<br>hay một bản dịch, hay một lượt đọc thử.`,
    [`i read every message, though i reply slowly. anything from "this stayed with me" to "would you let me translate this into french" — both have happened.`]: `Tôi đọc mọi tin nhắn, dù trả lời chậm. Từ "điều này ở lại với tôi" đến "cho tôi dịch bài này sang tiếng Pháp nhé" — cả hai đều đã từng xảy ra.`,
    [`your name (optional)`]: `tên bạn (không bắt buộc)`,
    [`your email`]: `email của bạn`,
    [`a short note…`]: `một lời nhắn ngắn…`,
    [`the quiet letter →`]: `lá thư lặng lẽ →`
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
    '.search-input', 'input[placeholder]', 'textarea[placeholder]',
    // chrome added for full EN↔VI coverage (text-only nodes; safe to swap)
    '.sec-k', '.letter-text p', '.sub-fine', '.index-empty', '.empty p',
    '.tag', '.rresume span', '.e-status', '.r-status', '.feat-status',
    '.spine .vert', 'footer .fine', 'footer .foot-line',
    '.lede', '.scribble', '.sec-sub', '.entry', '.note', '.closing p',
    // about page
    '.room-kind', '.attr', '.cap', '.tagline', '.lead', '.bio blockquote', '.process blockquote', '.process p', '.room-row p', '.hero .meta span'
  ].join(',');

  const WMref = window.WM || (window.WM = {});

  WMref.i18n = {
    lang: 'en',
    dict: VI,

    // Translate one UI string (for JS-generated text). Falls back to English.
    t: function (en) {
      if (this.lang !== 'vi') return en;
      const v = VI[norm(en)];
      return v !== undefined ? v.replace(/<[^>]+>/g, '') : en;
    },

    apply: function (lang, silent) {
      const toVi = lang === 'vi';
      this.lang = lang;
      document.documentElement.lang = lang;

      // Explicit-key translations. Any [data-i18n] element has its whole
      // innerHTML swapped for the VI value (which may itself be HTML). This is
      // how decorated headlines translate — split lines, a swash SVG, a
      // leading arrow — cases the text-matcher below deliberately skips.
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const k = norm(el.getAttribute('data-i18n'));
        if (toVi && VI[k] !== undefined) {
          if (el.dataset.i18nEn === undefined) el.dataset.i18nEn = el.innerHTML;
          el.innerHTML = VI[k];
        } else if (!toVi && el.dataset.i18nEn !== undefined) {
          el.innerHTML = el.dataset.i18nEn;
        }
      });

      document.querySelectorAll(SELECTORS).forEach(el => {
        if (el.hasAttribute('data-i18n')) return; // owned by the explicit pass above
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

      // silent = re-translating freshly injected DOM, not a user language
      // change: don't persist (would clobber the saved choice before init
      // reads it) and don't re-broadcast wm:lang.
      if (!silent) {
        try { localStorage.setItem('wm.lang', lang); } catch (e) {}
        // Let pages re-render their JS-generated strings in the new language
        try { window.dispatchEvent(new CustomEvent('wm:lang', { detail: { lang: lang } })); } catch (e) {}
      }
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
      'body{animation:wmFadeIn .34s ease both}' +
      'body.wm-leaving{opacity:0 !important;transition:opacity .16s ease}' +
      '@media(prefers-reduced-motion:reduce){body{animation:none}body.wm-leaving{transition:none}}';
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
    setTimeout(function () { window.location.href = url; }, 150);
  }, true);

  // Speed: start fetching an internal page the moment its link is hovered/touched,
  // so by click time it's usually already in cache.
  const prefetched = {};
  function prefetch(a) {
    if (!internalLink(a)) return;
    const href = a.href.split('#')[0];
    if (prefetched[href]) return;
    prefetched[href] = 1;
    try {
      const l = document.createElement('link');
      l.rel = 'prefetch'; l.href = href; l.as = 'document';
      document.head.appendChild(l);
    } catch (e) {}
  }
  document.addEventListener('mouseover', function (e) {
    const a = e.target.closest ? e.target.closest('a') : null;
    if (a) prefetch(a);
  }, { passive: true });
  document.addEventListener('touchstart', function (e) {
    const a = e.target.closest ? e.target.closest('a') : null;
    if (a) prefetch(a);
  }, { passive: true });

  // Restore visibility if returning via back/forward cache
  window.addEventListener('pageshow', function () {
    document.body.classList.remove('wm-leaving');
  });
})();
