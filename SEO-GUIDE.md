# SEO — Kody · Lâm Quế Chi

Hướng dẫn ngắn gọn: **mình đã làm gì**, và **bạn chạy/kiểm tra thế nào**.
Trang web: `https://lamquechi.github.io/Kody/`

---

## 1) Mình đã cài sẵn những gì (đã có trên site)

| Hạng mục | Tệp / nơi | Tác dụng |
|---|---|---|
| **robots.txt** | `/robots.txt` | Cho phép Google vào, trỏ tới sitemap |
| **sitemap.xml** | `/sitemap.xml` | Liệt kê 12 URL (trang chính + 8 truyện) để Google tìm ra hết |
| **Thẻ canonical** | mọi trang công khai | Báo URL "chuẩn", tránh trùng lặp |
| **Open Graph / Twitter** | mọi trang | Ảnh + tiêu đề đẹp khi chia sẻ Facebook/X/Zalo |
| **Dữ liệu có cấu trúc (JSON-LD)** | home (WebSite), about (Person), library (Collection), **mỗi truyện (Article)** | Google hiểu đây là tác giả + tác phẩm |
| **Tiêu đề/mô tả riêng cho TỪNG truyện** | `reader.html` (tự đặt theo bài đang đọc) | Mỗi truyện có "danh thiếp" riêng trên Google |
| **noindex** | hub, editor, login, shelf, 404 | Trang riêng tư/quản trị không bị lập chỉ mục |

> Khi đăng truyện mới: nói mình một câu, mình cập nhật `sitemap.xml` (hoặc mình
> sẽ tự sinh sitemap mỗi lần build nếu bạn muốn).

---

## 2) Đăng ký Google Search Console (việc QUAN TRỌNG NHẤT — làm 1 lần, ~10 phút)

Đây là bảng điều khiển của Google để site bạn được "nhìn thấy".

1. Vào **https://search.google.com/search-console** → đăng nhập Gmail.
2. **Add property** → chọn ô **URL prefix** → dán: `https://lamquechi.github.io/Kody/`
3. Google cho bạn **mã xác minh**. Cách dễ nhất cho GitHub Pages:
   - Chọn **HTML tag** → copy đoạn `<meta name="google-site-verification" content="XXXX">`
   - **Gửi đoạn đó cho mình**, mình dán vào `index.html` và đẩy lên (1 phút).
   - (Hoặc chọn **HTML file** → tải file `googleXXXX.html` lên gốc repo qua
     GitHub → *Add file → Upload files*.)
4. Bấm **Verify**.
5. Vào mục **Sitemaps** → nhập `sitemap.xml` → **Submit**.
6. Xong. Vài ngày Google sẽ bắt đầu lập chỉ mục. Dùng **URL Inspection** (ô tìm
   trên cùng) để "Request indexing" cho từng trang muốn lên nhanh.

> (Tùy chọn) **Bing Webmaster Tools** (bing.com/webmasters) — bấm *Import from
> Google Search Console* là xong, có thêm Bing + ChatGPT search.

---

## 3) Cách KIỂM TRA (bất cứ lúc nào)

- **Sitemap chạy chưa?** mở `https://lamquechi.github.io/Kody/sitemap.xml`
- **robots chạy chưa?** mở `https://lamquechi.github.io/Kody/robots.txt`
- **Dữ liệu có cấu trúc đúng chưa?** → **Rich Results Test**:
  `https://search.google.com/test/rich-results` → dán URL truyện → phải thấy *Article*.
- **Thẻ chia sẻ (ảnh/tiêu đề) đẹp chưa?** → dán URL vào
  `https://www.opengraph.xyz` (xem trước thẻ Facebook/X).
- **Tốc độ + Core Web Vitals** → **PageSpeed Insights**:
  `https://pagespeed.web.dev` → dán URL → xem điểm Mobile/Desktop.
- **Đã được index chưa?** gõ trên Google: `site:lamquechi.github.io/Kody`

---

## 4) Thói quen tốt để lên hạng

- **Tiêu đề & mô tả**: mỗi bài một mô tả 1–2 câu, có "từ khoá" tự nhiên (mưa,
  tản văn, Sài Gòn…). Trong Studio mình đã có ô **Findability** (focus phrase +
  meta description) — điền vào đó.
- **Chia sẻ**: đăng link truyện lên Facebook/Threads/X — thẻ OG đã đẹp sẵn, và
  liên kết từ mạng xã hội giúp Google tìm ra nhanh hơn.
- **Viết đều**: nội dung mới + cập nhật là tín hiệu tốt nhất cho SEO.
- **Liên kết nội bộ**: các "Read next", "Library", motif đã liên kết chéo — giữ vậy.

---

## 5) Giới hạn cần biết (và cách mình bù lại)

Trang đọc (`reader.html`) hiển thị truyện bằng JavaScript (hiệu ứng lật trang).
Google có chạy JS nhưng không phải bot nào cũng vậy. Mình đã bù bằng:
- **sitemap** liệt kê đủ URL truyện,
- **tiêu đề/mô tả/Article JSON-LD đặt sẵn** cho mỗi truyện,
- **canonical** rõ ràng.

Nếu sau này bạn muốn nội dung truyện hiện thẳng trong HTML (chắc ăn 100% cho mọi
bot), mình có thể thêm một bước "build" sinh sẵn trang tĩnh cho từng truyện —
nói mình khi cần.
