# SPORTS­VN - CÀI ĐẶT BẢN CHÍNH THỨC

## A. GitHub Pages
1. Sao lưu toàn bộ repository cũ.
2. Xóa source cũ trong branch `main` (không xóa repository).
3. Upload toàn bộ nội dung ZIP này vào thư mục gốc repository.
4. `CNAME` phải nằm ở thư mục gốc và chứa `sportsvn.com`.
5. Settings > Pages > Deploy from branch > `main` > `/ (root)`.
6. Chờ GitHub Pages build xong.
7. Kiểm tra `https://sportsvn.com/`.

## B. Supabase
1. Mở SQL Editor.
2. Chạy toàn bộ `schema.sql`.
3. Authentication > Users > Add user > tạo tài khoản quản trị đầu tiên.
4. Mở `SETUP-FIRST-ADMIN.sql`, thay email và chạy.
5. Authentication > URL Configuration:
   - Site URL: `https://sportsvn.com`
   - Redirect URL: `https://sportsvn.com/admin/`

## C. Đăng nhập
Mở `https://sportsvn.com/admin/`.
Dùng email/mật khẩu của user Supabase vừa tạo.

## D. Kiểm tra nghiệp vụ
- Tạo giải đấu.
- Tạo đơn vị/CLB.
- Tạo VĐV.
- Tạo đăng ký thi đấu và duyệt.
- Vào Bốc thăm, chọn giải và lưu nhánh.
- Vào Lịch & kết quả, nhập tỷ số/trạng thái.
- Tạo tin tức và đặt `published` để xuất hiện trên website.

## E. Thanh toán
Database đã có bảng đơn hàng/thanh toán. Mặc định provider là `bank_transfer` và chưa bật tự động. Muốn thu tiền tự động qua VNPay/SePay/VietQR cần tài khoản merchant và webhook/Edge Function riêng. Không đưa secret key vào frontend.

## F. Quan trọng
`config.js` chứa Publishable key nên có thể xuất hiện trên frontend. Tuyệt đối không đưa `sb_secret_...`, Service Role Key, database password, webhook secret hoặc API key AI vào GitHub.
