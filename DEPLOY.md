# Triển khai SportsVN

## GitHub Pages
Giữ `index.html` ở thư mục gốc. Nếu dùng thư mục admin, giữ nguyên `admin/index.html`.

## Domain
CNAME phải trỏ về tên miền đang sử dụng. Sau khi Pages hoạt động, vào Settings → Pages → Custom domain để xác nhận domain.

## Supabase Auth
Trong Authentication → URL Configuration, thêm URL website chính và URL `/admin/` nếu cần cho redirect. Khi triển khai OAuth hoặc reset password, phải thêm các callback URL tương ứng.
