# ADR-0001: Kiến trúc MVP và các đầu vào cần xác nhận

- Trạng thái: Được đề xuất cho MVP
- Ngày: 2026-07-27
- Phạm vi: MYN-001

## Bối cảnh

MYNORA BAKERY bán bánh đặt trước tại Đà Nẵng. Website cần cho khách đặt hàng
không cần tạo tài khoản, đồng thời hỗ trợ quản trị catalog, lịch nhận đơn và
đơn hàng. Tài liệu kiến trúc tổng thể là nguồn yêu cầu chính.

Khảo sát ngày 2026-07-27 xác nhận workspace chưa có mã nguồn, cấu hình hosting,
README, lockfile hoặc repository Git. Các tài sản hiện có gồm logo gốc, 19 ảnh
JPG và danh sách sản phẩm ở dạng DOCX.

## Quyết định

### 1. Kiến trúc và stack

Sử dụng modular monolith với Next.js App Router và TypeScript strict. Dự án
chứa storefront, admin và server layer trong cùng một repository; không tách
microservice ở MVP.

Styling dùng Tailwind CSS cùng các primitive có hỗ trợ accessibility. Validation
server-side dùng Zod. Font dự kiến là Cormorant Garamond cho heading/branding và
Be Vietnam Pro cho nội dung tiếng Việt.

Lý do: phù hợp mô hình MVP, dễ triển khai trên Vercel và giữ được ranh giới module
để mở rộng sau này.

### 2. Dữ liệu, xác thực và phân quyền

Sử dụng Supabase PostgreSQL, Supabase Auth và Supabase Storage. Mọi migration,
seed phát triển và chính sách RLS sẽ nằm trong repository.

Khách checkout với tư cách vãng lai. Chỉ admin/nhân viên đăng nhập; role được
kiểm tra cả ở server và RLS. Public chỉ được đọc catalog đang active, không đọc
PII hay dữ liệu vận hành.

### 3. Thanh toán MVP

MVP thiết kế payment qua interface `PaymentProvider`; mặc định chỉ bật chuyển
khoản thủ công. COD chỉ được bật sau khi chủ thương hiệu xác nhận chính sách.
payOS để giai đoạn 1.1, cùng webhook có xác minh chữ ký và idempotency.

Lý do: chưa có thông tin tài khoản nhận tiền, chính sách COD hoặc thông tin pháp
lý để hoàn tất cấu hình cổng thanh toán.

### 4. Giá, lịch nhận và capacity

Giá lưu là số nguyên VND và luôn được đọc/tính lại ở server. Không hard-code giá,
variant, phí giao, lịch nhận đơn hoặc secret trong UI.

MVP ưu tiên cơ chế capacity point: mỗi variant có điểm sản xuất, mỗi slot có tổng
điểm tối đa. Thời gian phải tính theo `Asia/Ho_Chi_Minh`; ngày khả dụng lấy lead
time dài nhất trong giỏ và áp dụng cutoff, blackout date, slot mở/đóng.

Lý do: cơ chế này phản ánh tốt độ phức tạp khác nhau giữa các loại bánh và vẫn cho
phép admin điều chỉnh vận hành mà không sửa code.

### 5. Môi trường và triển khai

Tách môi trường local, preview và production. Production dùng `mynora.com` với
một canonical host; không thay đổi DNS hay dùng credential production trước khi
chủ thương hiệu cung cấp thông tin và kế hoạch rollback.

## Đầu vào bắt buộc còn chờ xác nhận

1. Giá, quy cách/variant, lead time, min/max quantity, capacity point và trạng
   thái bán cho từng sản phẩm.
2. Gán chính xác 19 ảnh hiện có cho sản phẩm, alt text và ảnh đại diện; cần xác
   nhận liệu ảnh đủ cho 8 sản phẩm.
3. Khu vực giao tại Đà Nẵng, phí giao, đơn tối thiểu, giờ chốt đơn, ngày nghỉ,
   slot nhận/giao và giới hạn capacity.
4. Số điện thoại, email, địa chỉ nhận bánh, giờ hoạt động và liên kết mạng xã hội.
5. Chính sách đặt cọc, hủy/đổi, bảo quản, giao hàng, khiếu nại và quyền riêng tư.
6. Phương thức thanh toán được bật, thông tin tài khoản chuyển khoản và quyết định
   có nhận COD hay không.
7. Tài khoản/dự án Supabase, Vercel, email provider, analytics và payment provider
   khi đến phase tích hợp tương ứng. Không lưu secret trong repository.

## Hệ quả

Có thể tiếp tục Phase 1 để thiết lập nền tảng kỹ thuật và tích hợp tài sản thương
hiệu mà không cần các credential production. Không thể nghiệm thu catalog thật,
checkout, delivery availability hay payment trước khi các dữ liệu vận hành ở trên
được chủ thương hiệu xác nhận.
