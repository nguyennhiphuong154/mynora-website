# MYNORA — nâng cấp yêu cầu đặt bánh

## 1. Đã thay đổi gì
Form tại /dat-banh và /lien-he dùng cùng component, giữ màu navy #092d49, nền kem #f8f5ed, xanh sương #e3edf0 và typography hiện tại. Tách thông tin khách, nhiều món/số lượng, ngày/khung giờ mong muốn, giao hàng/tự nhận, người nhận khác, ghi chú, consent. Giữ quy định đặt trước 5 ngày. Không có checkout, thanh toán hoặc tổng tiền giả.

## 2. Các file đã sửa
- app/dat-banh/page.tsx
- app/lien-he/page.tsx
- app/lien-he/contact-form.tsx
- app/lien-he/contact-form.module.css
- app/api/order-requests/route.ts
- app/api/order-requests/retry/route.ts
- app/lib/catalog.ts
- app/data/site-data.ts
- app/components/catalog-browser.tsx
- app/components/catalog-cards.tsx
- app/components/product-search.tsx
- app/page.tsx (chỉ nguồn dữ liệu Menu/trạng thái; không đổi thứ tự Hero, Bánh nổi bật, Menu)
- app/san-pham/page.tsx
- app/san-pham/[slug]/page.tsx
- app/danh-muc/[slug]/page.tsx
- app/tim-kiem/page.tsx
- app/admin/[[...section]]/page.tsx
- app/admin/[[...section]]/order-requests.tsx
- supabase/functions/_shared/order.ts
- supabase/functions/_shared/notification.ts
- supabase/functions/mynora-order-requests/index.ts
- supabase/migrations/20260907074403_cake_order_requests.sql
- tests/order-requests.test.mjs
- tests/order-database.sql
- package.json
- .env.example

## 3. Luồng đặt bánh mới
Khách → ContactForm (validation và khóa gửi) → POST /api/order-requests → Supabase Edge Function mynora-order-requests (validation lại) → RPC submit_cake_order → lưu cake_order_requests và cake_order_notifications trong cùng transaction → Resend → trả mã yêu cầu, trạng thái pending.

Lỗi API không xóa form. Gửi lại cùng payload dùng cùng UUID idempotency; database khóa giao dịch theo UUID, không tạo hai đơn. Đổi payload đã lưu với cùng UUID bị chặn. Có honeypot và giới hạn 5 yêu cầu/số điện thoại/giờ, thực thi trong database.

## 4. Menu kết nối form
Nguồn dữ liệu vận hành là public.products, nối public.categories trên Supabase. app/lib/catalog.ts:getPublicCatalog dùng fetch no-store; cả Menu trang chủ, trang sản phẩm, trang danh mục, tìm kiếm và form dùng nguồn này. Không có danh sách bánh copy riêng cho form.

Món hidden/danh mục inactive bị loại khỏi Menu và form. Món coming_soon, paused, sold_out hiển thị disabled trong form. Server kiểm tra lại trạng thái tại thời điểm lưu, khóa bản ghi sản phẩm để giữ snapshot nhất quán.

Dữ liệu hiện tại không có variant hoặc giá xác nhận. Vì vậy không tự tạo lựa chọn size/vị hoặc giá. Snapshot lưu productId, productNameSnapshot, quantity. Nếu sau này thêm schema variant/giá, cần bổ sung mapping schema và validation tương ứng; bản này không tuyên bố hỗ trợ schema variant chưa tồn tại.

## 5. Email notification
Provider adapter: Resend HTTP API tại supabase/functions/_shared/notification.ts.
Nội dung email: supabase/functions/_shared/order.ts:orderEmail; dùng plain text dễ đọc, đủ mã đơn, người đặt, số điện thoại, kênh liên hệ, danh sách bánh/số lượng, ngày/khung giờ, hình thức nhận, địa chỉ, người nhận khác, ghi chú và thời điểm gửi.

Email gửi thất bại không xóa đơn. Outbox có status, attempts, last_error, next_attempt_at, locked_until, sent_at. Khóa gửi trong 2 phút tránh hai worker cùng gửi; Resend dùng idempotency key theo mã yêu cầu. Sau lỗi, được gửi lại từ 5 phút sau. Quản trị /admin/yeu-cau-dat-banh xem toàn bộ thông tin và nút gửi lại email đang chờ. Endpoint retry xác thực admin phía server. Có hỗ trợ secret riêng nếu cấu hình scheduler ngoài, chưa tự bật cron.

## 6. Database
Migration đã áp dụng vào Supabase MYNORA cdumtadwcyysxrbpglnq. Hai bảng mới: cake_order_requests, cake_order_notifications. Hai RPC service-only: submit_cake_order, claim_cake_notification. Có RLS, khách không đọc hoặc ghi trực tiếp các bảng này; admin đang hoạt động có quyền đọc. Không thay đổi đơn/contact cũ.

## 7. Environment variables
Website hiện có:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

Website mới, tùy chọn:
- MYNORA_FACEBOOK_URL
- MYNORA_INSTAGRAM_URL

Supabase Edge Function secrets mới:
- ORDER_NOTIFICATION_EMAIL=nguyennhiphuong154@gmail.com
- ORDER_NOTIFICATION_FROM=<địa chỉ gửi đã xác minh trong Resend>
- RESEND_API_KEY=<khóa Resend>
- ORDER_RETRY_SECRET=<chỉ cần nếu dùng scheduler ngoài; không bắt buộc với nút retry admin>

SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY được nền tảng Edge Function cung cấp tự động; không đặt service role vào frontend. .env.example chứa tên biến, email nhận được người dùng chỉ định và giá trị trống cho secrets. Không ghi đè .env production. Cấu hình mẫu email nhận chưa thay thế việc lưu secret trong Supabase.

## 8. Test
- Typecheck: đạt.
- ESLint: đạt.
- Vinext build: đạt.
- Next.js build (Vercel): đạt.
- 7 unit test form/email: đạt.
- 2 test HTML trang chủ: đạt.
- SQL giao dịch rollback: đạt cho 1 món/tự nhận, nhiều món/giao hàng, snapshot, idempotency/conflict, outbox lock, giữ đơn khi email lỗi, món hidden/sold_out, rate limit và quyền truy cập. Mọi dữ liệu kiểm thử rollback, không tạo đơn thật.
- Browser: kiểm tra trường lỗi, conditional rendering, disable khi gửi, double click chỉ gọi API một lần, lỗi API giữ nội dung và gửi lại thành công với thông báo pending. Test gửi dùng API giả lập cục bộ; code giả lập đã được gỡ trước build cuối.
- Responsive: 320/375/390/430/768/1440px không có input tràn hoặc cuộn ngang.
- Variant: không áp dụng vì schema Menu chưa có variant.
- Chưa kiểm chứng email đến hộp thư thật vì thiếu Resend key và sender đã xác minh.

## 9. Việc chủ MYNORA cần làm
1. Trong Supabase → Edge Functions → Secrets, đặt ORDER_NOTIFICATION_EMAIL, ORDER_NOTIFICATION_FROM, RESEND_API_KEY như mục 7. Không cần gửi secret trong chat.
2. Bật các món muốn nhận trong /admin/san-pham (hiện cả 8 món đều coming_soon). Form tự cập nhật theo dữ liệu Menu; không tự ý bật mở bán trong nhiệm vụ này.
3. Bổ sung Facebook/Instagram chính thức vào biến website nếu muốn hiện link. Không có URL giả.
4. Gửi một yêu cầu thật sau khi cấu hình email, kiểm tra hộp thư và mục quản trị. Không coi email là hoạt động chỉ dựa trên build/test giả lập.
