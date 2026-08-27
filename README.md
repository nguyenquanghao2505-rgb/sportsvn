# ALLSPORTS / SportsVN Dashboard

Giao diện dashboard quản lý giải thể thao dựng lại theo ảnh tham chiếu người dùng cung cấp.

## Chạy nhanh

Mở `index.html` bằng trình duyệt, hoặc chạy server tĩnh:

```bash
npx serve .
```

## Thành phần
- `index.html`: cấu trúc dashboard.
- `styles.css`: giao diện responsive, sidebar, cards, bảng, biểu đồ.
- `app.js`: tìm kiếm, điều hướng, toast, biểu đồ canvas.
- `tests/smoke.test.js`: kiểm tra cấu trúc cơ bản.

## Ghi chú tích hợp
Các module hiện là frontend demo với dữ liệu mẫu. Có thể nối tiếp vào Supabase/API cho Organizer, giải đấu, VĐV, bốc thăm, lịch, kết quả, BXH, nội dung và phân quyền.
