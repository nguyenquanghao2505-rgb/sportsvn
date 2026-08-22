# SportsVN V6 — Nền tảng quản lý giải thể thao

Bản nâng cấp tiếp theo của SportsVN, giữ hướng triển khai GitHub Pages + Supabase.

## Có gì trong bản này
- Dashboard quản lý theo phong cách ALLSPORTS: sidebar, thống kê, giải đang diễn ra, trận LIVE, tin tức, thư viện.
- Đăng nhập Supabase tại `/admin/`.
- Bốc thăm tự động: tránh cùng đơn vị ở vòng 1, BYE, bracket 8/16/32/64, xuất CSV.
- Lịch thi đấu và quản lý đặt sân/địa điểm.
- Mô hình tài khoản nhiều tổ chức: mỗi chủ giải chỉ thao tác trên dữ liệu `owner_id` của mình.
- Hồ sơ VĐV, đơn vị/CLB, kết quả, BXH, huy chương.
- Tin tức + trường `source_name/source_url` để ghi nguồn báo chí và liên kết bài gốc.
- AI SportsVN: giao diện trợ lý + Edge Function contract.
- Thanh toán: giao diện gói dịch vụ + Edge Function contract cho cổng thanh toán.
- Thông tin liên hệ: nguyenquanghao2505@gmail.com · 0905771177 · Zalo 0905771177 / 0384913999.

## Cài vào GitHub
1. Giải nén ZIP.
2. Giữ `CNAME` nếu repo hiện tại đã trỏ `sportsvn.com`.
3. Upload/replace các file `index.html`, `styles.css` và thư mục `admin/`.
4. Vào Supabase SQL Editor, chạy `supabase/schema.sql`.
5. Kiểm tra Authentication → URL Configuration: Site URL `https://sportsvn.com`; Redirect URL `https://sportsvn.com/admin/`.
6. Đăng nhập `/admin/` bằng tài khoản Supabase.

## Lưu ý bảo mật
`admin/config.js` chỉ chứa publishable key. Không đưa Service Role Key, database password, payment secret hoặc AI API key vào GitHub. Các khóa bí mật phải đặt ở Supabase Edge Function Secrets.

## Thanh toán thật
Bản ZIP đã có giao diện và endpoint khung. Để thu tiền thật cần chọn nhà cung cấp (VNPay/SePay/VietQR...), tạo merchant account, cấu hình webhook và secrets ở Edge Function. Không thể tạo chữ ký thanh toán thật chỉ bằng HTML tĩnh.

## AI thật
Giao diện đang hoạt động ở chế độ cục bộ. Để gọi AI thật, triển khai `supabase/functions/ai` và đặt API key ở Edge Function Secrets.
