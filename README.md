# SportsVN Production

Bộ source mới dành cho vận hành thật trên GitHub Pages + Supabase.

## 1. Upload
Giữ `CNAME`, `index.html`, `styles.css`, `app.js`, `config.js`, `supabase-client.js`, `core.mjs`, `schema.sql`, thư mục `admin/` và các tài liệu.

## 2. Supabase
Mở SQL Editor và chạy toàn bộ `schema.sql` một lần trên project SportsVN.

Sau đó vào Authentication > Users tạo tài khoản quản trị đầu tiên. Tài khoản mới mặc định là `organizer`; dùng SQL Editor để cấp `super_admin` cho tài khoản đầu tiên sau khi tạo:

```sql
update public.profiles p set role='super_admin' where p.id=(select id from auth.users where email='EMAIL_CUA_ANH');
```

## 3. Auth URL
Authentication > URL Configuration:
- Site URL: https://sportsvn.com
- Redirect URL: https://sportsvn.com/admin/

## 4. Bảo mật
Chỉ dùng Publishable key ở frontend. Không đưa Secret key/Service Role Key vào GitHub.

## 5. Thanh toán
Bản này lưu đơn hàng và trạng thái thanh toán trong database. Thanh toán tự động qua VNPay/SePay/VietQR cần merchant credentials + webhook/Edge Function của nhà cung cấp; không thể tạo chữ ký thật bằng frontend tĩnh.

## 6. Kiểm thử
Máy phát triển có Node.js:
`npm test`

## 7. Cấu trúc
- `/` website công khai
- `/admin/` quản trị
- `schema.sql` database + RLS
- `core.mjs` nghiệp vụ bốc thăm/BYE/BXH
