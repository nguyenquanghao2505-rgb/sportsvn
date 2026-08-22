# Hướng dẫn triển khai SportsVN V6

## 1. GitHub Pages
Upload toàn bộ nội dung ZIP lên branch `main`. Không xóa `CNAME` cũ nếu nó chứa `sportsvn.com`.

## 2. Supabase Auth
- User hiện tại: `nguyenquanghao2505@gmail.com`.
- Tạo thêm tài khoản khách bằng Authentication → Users hoặc từ luồng đăng ký sau này.
- Sau khi user đăng nhập, tạo một dòng `profiles` với `role=owner` để user trở thành chủ giải.

## 3. Phân quyền nhiều khách hàng
Tất cả bảng quản lý có `owner_id`. RLS chỉ cho chủ tài khoản đọc/ghi dữ liệu của mình; `super_admin` có thể quản trị toàn hệ thống.

## 4. Đặt sân
`venues` lưu địa điểm; `venue_bookings` lưu khung giờ. Front-end có kiểm tra xung đột và backend nên bổ sung constraint/transaction khi triển khai production.

## 5. Tin báo chí
Chỉ nhập tiêu đề/tóm tắt/nội dung được phép sử dụng và lưu `source_name` + `source_url` để dẫn nguồn. Không sao chép nguyên bài báo của bên thứ ba nếu không có quyền.
