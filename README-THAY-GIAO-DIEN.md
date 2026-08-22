# SportsVN — giao diện website công khai

Bộ này xây lại trang chủ SportsVN theo hướng website tin tức + giải đấu.

## File cần đưa lên GitHub
- `index.html` — trang chủ công khai
- `styles.css` — giao diện
- `app.js` — đăng nhập/đăng ký + giao diện
- `home-data.mjs` — dữ liệu mẫu và hàm lọc tin

## Không xóa
Giữ nguyên:
- `admin.html`
- `admin.js`
- `auth-utils.mjs`
- `draw-utils.mjs`
- `config.js`
- `schema.sql`
- các file test/core hiện có

## Lưu ý
`config.js` phải có `SPORTSVN_CONFIG.SUPABASE_URL` và `SPORTSVN_CONFIG.SUPABASE_ANON_KEY`.
Trang chủ vẫn hiển thị nếu Supabase chưa cấu hình, nhưng đăng nhập/đăng ký sẽ báo chưa cấu hình.

RED check: exit=1; Node.js v22.16.0
GREEN check: exit=0; PASS
