# Admin Customer Requests

- Route Admin: `/admin/yeu-cau-dat-banh`.
- Component chính: `app/admin/[[...section]]/order-requests.tsx`.
- API chi tiết/cập nhật: `GET` và `PATCH /api/admin/order-requests/:id`.
- Database: `cake_order_requests` là nguồn dữ liệu chính; `cake_order_notifications` lưu trạng thái email; `cake_order_request_events` lưu lịch sử tạo và đổi trạng thái.
- Mã yêu cầu: `MYN-000001` tăng tuần tự. Yêu cầu cũ được gán mã khi migration chạy.
- Trạng thái: `new`, `contacted`, `confirmed`, `completed`, `cancelled`; giao diện hiển thị tiếng Việt.
- Tìm kiếm: chạy tại database trên `request_code`, `customer_name`, `customer_phone`, có chỉ mục trigram cho tên và số điện thoại.
- Bộ lọc: trạng thái; hôm nay, 7 ngày, 30 ngày hoặc tất cả.
- Sắp xếp: mới nhất, cũ nhất hoặc ngày nhận gần nhất.
- Phân trang: server-side, 20 yêu cầu mỗi trang.
- Cập nhật: Admin đổi trạng thái hoặc lưu `admin_note` qua API. Trigger database tự cập nhật `updated_at` và ghi event khi trạng thái thay đổi.
- Dashboard: hiển thị yêu cầu mới hôm nay và tổng yêu cầu đang chờ xử lý. Sidebar có badge số yêu cầu `new`.
- Authorization: trang và API xác minh phiên Supabase cùng bản ghi `admin_users`; RLS chỉ cho Admin đọc/cập nhật. `anon` không có quyền đọc yêu cầu, lịch sử hay ghi chú nội bộ.
- Snapshot: tên bánh, quy cách và giá (khi có) đọc từ JSON snapshot trong yêu cầu, không phụ thuộc menu hiện tại.

## Database Migration

- `supabase/migrations/20260914143000_admin_order_request_history.sql`: thêm mã yêu cầu, trạng thái, ghi chú nội bộ, cột tìm kiếm, lịch sử sự kiện, trigger, chỉ mục và RLS.
- `supabase/migrations/20260914150000_default_new_order_status.sql`: đặt trạng thái mặc định của yêu cầu mới thành `new`.
- `supabase/migrations/20260914151000_grant_request_code_sequence.sql`: cấp quyền cho Edge Function tạo mã yêu cầu tuần tự.
- Cả ba migration đã chạy trên Supabase production ngày 14/09/2026. Không xóa hoặc ghi đè yêu cầu production.

## Verification

- Database integration: 21 yêu cầu tạm cùng số điện thoại được lưu thành 21 bản ghi; tìm theo một phần số điện thoại trả đúng; trang đầu giới hạn 20; mã yêu cầu hợp lệ; snapshot không thay đổi; trạng thái và ghi chú được lưu; lịch sử có event tạo và đổi trạng thái. Dữ liệu thử đã được dọn sạch.
- Quyền `anon` không thể đọc `cake_order_requests` hoặc `cake_order_request_events`.
- Email lỗi không xóa yêu cầu: luồng hiện tại luôn lưu database trước khi gọi nhà cung cấp email.
