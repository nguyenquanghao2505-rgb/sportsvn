# SportsVN Admin — Giai đoạn 1

## Mục tiêu

Bộ file này thêm khu vực `sportsvn.com/admin` với:

- đăng nhập tài khoản `admin`;
- Supabase Auth để mật khẩu không nằm trong mã nguồn;
- phiên đăng nhập;
- đăng xuất;
- Dashboard quản trị ban đầu.

## 1. Tạo Supabase

1. Vào https://supabase.com/
2. Tạo tài khoản và tạo một project mới.
3. Trong project mở **Authentication → Users**.
4. Chọn **Add user → Create new user**.
5. Tạo:
   - Email: `admin@sportsvn.com`
   - Password: tự đặt một mật khẩu mạnh.
6. Không bật chức năng xác nhận email nếu muốn đăng nhập ngay bằng tài khoản này.

## 2. Lấy thông tin kết nối

Trong Supabase mở **Project Settings → API** và lấy:

- Project URL
- Publishable/Anon key

Mở file:

`admin/config.js`

thay:

```js
window.SPORTSVN_SUPABASE = {
  url: "YOUR_SUPABASE_URL",
  anonKey: "YOUR_SUPABASE_ANON_KEY"
};
```

bằng thông tin thật.

**Không đưa `service_role` key vào website.**

## 3. Đăng lên GitHub

Giữ nguyên cấu trúc thư mục và upload toàn bộ file vào repository SportsVN.

Sau khi GitHub Pages cập nhật, mở:

`https://sportsvn.com/admin/`

Tên đăng nhập:

`admin`

Mật khẩu:

mật khẩu anh đã tạo cho `admin@sportsvn.com`.

## Lưu ý

Giai đoạn này mới là nền móng đăng nhập + Dashboard. Các module Tin tức, Giải đấu, VĐV, Lịch, Kết quả và Bốc thăm sẽ được kết nối ở các giai đoạn tiếp theo.
