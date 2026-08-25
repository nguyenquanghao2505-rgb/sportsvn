# DEPLOY PRODUCTION

1. Backup repository cũ.
2. Xóa source cũ trong repository và upload toàn bộ source trong ZIP này.
3. Không xóa `CNAME`.
4. GitHub Settings > Pages > Deploy from branch `main` / root.
5. Chờ Pages build.
6. Custom domain: `sportsvn.com`.
7. Supabase SQL Editor: chạy `schema.sql`.
8. Supabase Authentication > Users: tạo tài khoản thật.
9. Cấp `super_admin` cho tài khoản đầu tiên.
10. Authentication > URL Configuration: đặt Site URL và Redirect URL.
11. Mở `https://sportsvn.com/`.
12. Mở `https://sportsvn.com/admin/` và đăng nhập.
13. Tạo thử giải đấu, đơn vị, VĐV, tin tức. Khi kiểm tra xong mới công bố rộng rãi.
