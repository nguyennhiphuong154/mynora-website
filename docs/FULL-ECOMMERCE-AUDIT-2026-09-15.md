# MYNORA Full E-commerce — Audit trước triển khai

Ngày audit: 15/09/2026  
Production: `https://mynorabakery.com`  
Source: `nguyennhiphuong154/mynora-website`, nhánh `main`  
Supabase project: `cdumtadwcyysxrbpglnq`

## Phạm vi và nguyên tắc

Đây là kết quả audit bắt buộc trước khi triển khai roadmap Full E-commerce. Trong bước này không thay đổi schema production, không thay đổi luồng đặt bánh và không deploy giao diện mới.

Các quyết định nền tảng:

- Giữ website, logo, ảnh, màu và phong cách hiện tại.
- Mở rộng kiến trúc hiện có; không viết lại toàn bộ website.
- Supabase là nguồn dữ liệu chuẩn cho catalog, availability, order và admin.
- Tạo order trong một giao dịch server-side; không tin giá, tổng tiền hoặc availability từ client.
- Guest checkout là luồng chính. Customer account được bổ sung sau.
- Hoàn thành và kiểm thử từng Phase trước khi chuyển Phase tiếp theo.

## A. Kiến trúc hiện tại

### Ứng dụng

- Next.js 16.2.6 App Router, React 19.2.6 và TypeScript 5.9.3.
- Dùng `@supabase/ssr` và `@supabase/supabase-js` 2.112.3.
- Có 21 page routes, 3 API routes và 2 Supabase Edge Functions.
- Production deploy từ GitHub lên Vercel; `vercel.json` chạy `pnpm exec next build`.
- Script local dùng Vinext/Vite, trong khi Vercel dùng Next.js native. Đây là hai đường build cần được giữ đồng nhất bằng cùng bộ test.

### Luồng dữ liệu

- Trang chủ, menu và chi tiết sản phẩm đọc `products` từ Supabase qua server.
- Tên danh mục, nội dung vận hành, FAQ, social, hero và featured rail vẫn dùng dữ liệu tĩnh trong `app/data/site-data.ts`.
- Ảnh nằm trong `public/images`; chưa có Supabase Storage bucket.
- Form `/dat-banh` gửi vào Next API proxy, rồi tới Edge Function `mynora-order-requests`.
- Edge Function xác thực payload, gọi RPC `submit_cake_order`, lưu yêu cầu và hàng đợi email trong một transaction.
- Admin dùng Supabase Auth. Quyền thật được kiểm tra server-side bằng bảng `admin_users` và RLS.

### Giao diện và design system

- Brand chính: navy, kem sáng, xanh mist; font Cormorant Garamond và Be Vietnam Pro.
- Homepage, storefront và Admin có các nhóm CSS riêng nhưng đang tập trung trong một số file lớn.
- Có breakpoint mobile và focus styles. Một số animation đã hỗ trợ reduced motion.
- Design tokens chưa thống nhất hoàn toàn: có token root cũ và token scoped cho homepage/storefront.

### SEO và analytics

- Có title, description, Google Search Console verification và Google Analytics `G-5GBZK9DQYX`.
- Nhiều trang sản phẩm/danh mục đang đặt `robots.index = false`.
- Chưa có canonical tổng thể, Open Graph/Twitter đầy đủ, sitemap, robots route, Product schema hoặc LocalBusiness schema.

## B. Những chức năng đã có

- Trang chủ, menu, lọc danh mục, tìm kiếm sản phẩm và trang chi tiết.
- 8 sản phẩm thật và 4 danh mục trong Supabase.
- Trang câu chuyện, hướng dẫn, giao nhận, bảo quản, FAQ, liên hệ, nhật ký bếp và chính sách.
- Form yêu cầu đặt bánh hỗ trợ nhiều món, số lượng, ngày mong muốn, khung giờ tự nhập, pickup/delivery, người nhận khác và ghi chú.
- Client và server cùng validate dữ liệu cơ bản.
- Chống gửi trùng bằng UUID idempotency key.
- Server kiểm tra sản phẩm đang mở trước khi lưu.
- Rate limit theo số điện thoại: tối đa 5 yêu cầu trong một giờ.
- Lưu snapshot tên món trong yêu cầu.
- Email owner qua Resend theo mô hình outbox; email lỗi không làm mất yêu cầu và có thể retry.
- Admin có quản lý sản phẩm cơ bản, bài viết, liên hệ và lịch sử yêu cầu đặt bánh.
- Admin yêu cầu xác thực thật; public không đọc được dữ liệu yêu cầu khách hàng.
- Lịch sử yêu cầu có mã `MYN-000001`, tìm kiếm, bộ lọc, phân trang, ghi chú nội bộ và timeline trạng thái.
- Google Search Console verification và Google Analytics đã được gắn.

## C. Những chức năng chưa có

### Năm module ưu tiên

1. **Availability Calendar:** chưa có ngày mở/đóng, slot, capacity, cutoff hoặc kiểm tra full.
2. **Preparation time:** chưa có thời gian chuẩn bị ở product/variant; hiện rule 5 ngày nằm trong file tĩnh và hàm validate.
3. **Cart:** `/gio-hang` chỉ là trang thông báo; chưa có LocalStorage, variant, quantity update hoặc tổng tiền.
4. **Checkout:** `/thanh-toan` chỉ là trang thông báo; form hiện tại là yêu cầu tư vấn, chưa phải checkout có giá.
5. **Order Admin:** Admin hiện quản lý `cake_order_requests`, chưa có order, payment, fulfillment hoặc capacity reservation đầy đủ.

### Các phần còn thiếu khác

- Product variants, SKU, price, compare price, size, serving size, allergen và storage instruction theo sản phẩm.
- Customer record, order items chuẩn hóa và lịch sử trạng thái order đầy đủ.
- Order success page có dữ liệu thật và tra cứu đơn bằng mã + số điện thoại.
- Customer account, address book và đồng bộ cart.
- Payment architecture, chuyển khoản và QR cấu hình từ Admin.
- Shipping settings, promotion, review và MYNORA Moments quản trị được.
- Admin Availability, Customers, Payments, Promotions, Content/Settings hoàn chỉnh.
- Email xác nhận cho khách và notification theo thay đổi trạng thái.
- Upload ảnh trong Admin và image storage.
- Analytics events cho `view_product`, `add_to_cart`, `begin_checkout`, `order_created`, `order_lookup`.

## D. Những phần cần giữ

- Toàn bộ nhận diện MYNORA: logo, màu navy/kem/mist, typography và ảnh hiện tại.
- Cấu trúc Next.js App Router và Supabase SSR.
- `products`, `categories`, `admin_users`, `posts`, `contact_submissions`.
- Supabase Auth, server-side admin allowlist và RLS.
- Cơ chế idempotency, database-first email outbox và retry.
- Snapshot dữ liệu món tại thời điểm khách gửi.
- Các route nội dung, navigation, footer và responsive behavior đang hoạt động.
- `cake_order_requests` làm lịch sử lead/request cũ; không xóa hoặc ép đổi thành order thương mại.

## E. Những phần cần refactor

### Nguồn dữ liệu

- Chuyển categories, operational settings, FAQ, social và hero/featured selection sang nguồn dữ liệu duy nhất trong Supabase theo từng bước.
- Xóa phụ thuộc catalog vào danh sách category tĩnh sau khi Phase 1 hoàn tất.
- Homepage featured rail hiện còn dựa trên file tĩnh, nên chưa đồng bộ hoàn toàn với Admin Products.

### Product

- Mở rộng `products` thay vì tạo bảng product trùng.
- Thêm `product_variants` cho giá, SKU, size, availability và preparation time.
- Bổ sung archive thay cho xóa cứng để giữ khóa tham chiếu và lịch sử order.
- Admin login hiện điền sẵn và kiểm tra một email hard-code ở client. Kiểm tra server/RLS đã đúng, nhưng client phải bỏ điều kiện hard-code để `admin_users` là nguồn quyền duy nhất.
- Edge Function đặt mật khẩu một lần hiện chỉ cho phép localhost và tên miền Sites cũ; chưa có `https://mynorabakery.com` trong allowlist. Phase 1 phải chuyển allowlist sang cấu hình production và thêm kiểm thử origin trước khi dùng lại luồng này.

### Design và frontend

- Chuẩn hóa design tokens dùng chung cho home, store, cart, checkout và Admin.
- Tách CSS lớn theo module, nhưng không đổi diện mạo.
- Sửa featured rail để tôn trọng `prefers-reduced-motion` nhất quán.
- Dùng `next/image` hoặc chiến lược ảnh tương đương sau khi xác định storage, kích thước và crop.

### Runtime và test

- Giữ cả Vinext và Next build trong CI cho đến khi quyết định một runtime chuẩn.
- Bổ sung test transaction/concurrency cho slot cuối, giá server-side, duplicate submit và product unavailable.
- Các test hiện tại chủ yếu kiểm tra validation, source contract và server-render; chưa có E2E checkout thật.

## F. Database hiện tại

### Bảng production

| Bảng | Vai trò | Số bản ghi lúc audit |
|---|---|---:|
| `admin_users` | Danh sách Admin được cấp quyền | 1 |
| `categories` | Danh mục sản phẩm | 4 |
| `products` | Catalog hiện tại | 8 |
| `posts` | Nhật ký bếp | 1 |
| `contact_submissions` | Liên hệ khách hàng | 0 |
| `cake_order_requests` | Yêu cầu đặt bánh hiện tại | 0 |
| `cake_order_notifications` | Outbox email owner | 0 |
| `cake_order_request_events` | Timeline yêu cầu | 0 |
| `admin_password_setup_tokens` | Token đặt mật khẩu một lần | 0 |

Tất cả bảng public hiện có đều bật RLS. Cả 8 sản phẩm đang là `coming_soon`; website chưa cho checkout thật.

### Schema chưa tồn tại

Chưa có `product_variants`, `customers`, `orders`, `order_items`, `order_status_history`, `availability_dates`, `availability_slots`, `payments`, `promo_codes`, `promo_usage`, `reviews`, `faqs`, `site_settings`, `social_links`, `customer_addresses`, `carts` hoặc `cart_items`.

### Storage

- Chưa có Supabase Storage bucket.
- Ảnh sản phẩm đang được deploy cùng source trong `public/images`.

### Security và performance audit

- Public không có quyền đọc order request, notification hoặc event.
- Admin read/update dựa trên JWT email + bản ghi `admin_users.is_active`.
- Service role chỉ dùng trong Edge Function; không xuất hiện trong frontend.
- Supabase cảnh báo Leaked Password Protection chưa bật.
- Có một foreign key chưa có index ở `admin_password_setup_tokens.user_id`.
- Có policy cũ bị chồng trên `posts` và `contact_submissions`; cần hợp nhất trong Phase 1 để giảm chi phí policy evaluation.
- Một số index chưa được sử dụng vì các bảng đang rất ít hoặc chưa có dữ liệu; chưa nên xóa chỉ dựa trên thống kê hiện tại.

## G. Kiến trúc Full E-commerce đề xuất

### Phân lớp

```text
Storefront / Admin
        ↓
Next.js Server Components + Route Handlers
        ↓
Supabase RPC / Edge Functions
        ↓
Postgres transaction + RLS + outbox
        ↓
Email / payment provider được cấu hình thật
```

### Nguồn dữ liệu chuẩn

- Supabase Postgres: product, variant, category, settings, availability, customer, order, payment và content.
- Supabase Storage hoặc ảnh local có manifest quản trị: chỉ chọn một nguồn theo giai đoạn, không ghi đường dẫn rải rác.
- LocalStorage: guest cart; chỉ lưu product/variant ID và quantity, không coi price là dữ liệu đáng tin.
- Server: luôn tải lại product/variant, price, preparation time, slot và promotion trước khi tạo order.

### Schema mục tiêu

#### Catalog

- Mở rộng `products`: `short_description`, `price_from`, `preparation_time_days`, `minimum_order`, `serving_size`, `storage_instruction`, `allergen_info`, `is_archived`.
- `product_variants`: product FK, name, SKU, price, compare price, preparation time override, minimum order, active, sort order.
- Giữ `categories`; bổ sung Admin CRUD/archive và dùng trực tiếp ở storefront.

#### Settings và availability

- `site_settings`: key, JSON value, public/private scope, updated_at.
- `availability_dates`: date duy nhất, trạng thái open/closed, capacity, cutoff time và ghi chú Admin.
- `availability_slots`: date FK, label, start/end time, capacity, active.
- Capacity đã dùng được tính từ order còn hiệu lực; tạo order dùng transaction và row lock để giữ slot cuối an toàn.

Ngày sớm nhất hợp lệ:

```text
max(global minimum_preorder_days, preparation_time lớn nhất trong cart)
```

Sau đó chỉ hiển thị ngày/slot đang mở, chưa qua cutoff và còn capacity.

#### Commerce

- `customers`: chuẩn hóa tên, phone, email và liên kết tùy chọn với Supabase Auth user.
- `orders`: UUID nội bộ, mã thân thiện `MYN-YYMMDD-NNN`, customer snapshot, receive date/slot, fulfillment, tiền, payment method/status, order status và notes.
- `order_items`: product/variant FK kèm snapshot tên, SKU, variant, unit price và quantity.
- `order_status_history`: from/to status, actor, public message và thời gian.
- `payments`: payment method/provider/reference/status/amount; không ghi nhận `paid` nếu chưa có xác nhận thật.
- `shipping_settings`, `promo_codes`, `promo_usage` được bổ sung ở Phase 6 hoặc sớm hơn khi checkout thật cần cấu hình.

### Transaction tạo order

1. Nhận idempotency key và payload tối thiểu.
2. Lock theo idempotency key.
3. Đọc lại product và variant active từ database.
4. Tính lại preparation time và ngày sớm nhất.
5. Lock availability date/slot; kiểm tra cutoff và capacity.
6. Tính subtotal, shipping, discount và total server-side.
7. Upsert customer theo phone/email đã chuẩn hóa.
8. Tạo order + order_items + history + payment pending/unpaid + notification outbox.
9. Commit transaction.
10. Trả mã order; gửi email ngoài transaction và retry nếu provider lỗi.

### RLS mục tiêu

- Anon chỉ đọc category/product/variant active và availability công khai tối thiểu.
- Guest không query order table trực tiếp; tra cứu qua RPC/API có rate limit bằng mã order + phone đã chuẩn hóa.
- Customer authenticated chỉ đọc order gắn với `auth.uid()`.
- Admin được kiểm tra bằng server và `admin_users`; không dựa vào email hard-code ở client.
- Service role chỉ ở Edge Function/server secrets.

## Thứ tự triển khai đã chốt

### Phase 1 — Foundation

- Hoàn thiện migration catalog/settings có tính tương thích ngược.
- Mở rộng Product và tạo Product Variant.
- Đồng bộ Categories và mọi bề mặt catalog về Supabase.
- Bỏ admin email hard-code ở client; chuẩn hóa helper kiểm tra quyền server.
- Chuẩn hóa design tokens mà không đổi brand.
- Tạo test migration, RLS, catalog sync và baseline responsive.

**Điều kiện hoàn tất:** Admin sửa một product/category và tất cả trang liên quan hiển thị đồng bộ; public chỉ đọc dữ liệu active; build/test sạch.

### Phase 2 — Shop

- Product detail hoàn chỉnh, variant/quantity, giá và preparation time.
- Guest cart bằng LocalStorage, merge item cùng product + variant.
- Cart validation cơ bản và analytics hooks chưa gửi dữ liệu giả.

**Điều kiện hoàn tất:** add/update/remove/persist cart hoạt động; sản phẩm unavailable không thể tiếp tục checkout.

### Phase 3 — Checkout

- Availability Calendar + Admin Lịch bánh.
- Customer/checkout, order transaction, success page.
- Server kiểm tra giá, preparation time, cutoff và capacity đồng thời.

**Điều kiện hoàn tất:** slot cuối không bị overbook, duplicate submit chỉ tạo một order và success page dùng dữ liệu order thật.

### Phase 4 — Order Management

- Admin Orders, chi tiết, payment/status, timeline và customer history.
- Tra cứu order bằng mã + phone với dữ liệu tối thiểu.
- Giữ lịch sử `cake_order_requests` cũ ở mục riêng hoặc nhãn “Yêu cầu cũ”.

### Phase 5 — Communication

- Email khách + owner, notification settings theo trạng thái.
- Social, FAQ và content settings từ Admin.
- Outbox/retry/idempotency cho từng loại notification.

### Phase 6 — Advanced

- Payment method cấu hình thật, chuyển khoản/QR khi chủ website cung cấp.
- Promotions, customer account và analytics events.
- Không tích hợp online payment cho đến khi có provider và tài khoản thật.

## Thông tin cần MYNORA cung cấp trước Phase 2–3

- Giá và variant/size thật của từng bánh.
- Preparation time và minimum order của từng product/variant.
- Những ngày/khung giờ có thể nhận bánh và capacity mặc định.
- Quy tắc cutoff ngày/giờ đóng đơn.
- Địa điểm pickup có được công khai hay chỉ gửi sau xác nhận.
- Cách tính phí giao hàng chính thức nếu thay đổi dữ liệu hiện tại.
- Email khách có bắt buộc hay tùy chọn.

Thông tin cần trước Phase 5–6:

- Facebook/Instagram URL chính thức.
- Tài khoản ngân hàng/QR và tên chủ tài khoản, nếu dùng chuyển khoản.
- Payment provider, nếu dùng online payment.
- Chính sách hủy, đổi, hoàn tiền đã được chủ MYNORA phê duyệt.

## Baseline kiểm thử

- TypeScript: đạt.
- ESLint: đạt.
- Vinext production build: đạt.
- Next.js/Vercel production build: đạt.
- Automated tests: 17/17 đạt.
- Production database: 4 category, 8 product, 1 Admin; không có order/request thật tại thời điểm audit.

## Kết luận audit

Source hiện tại là nền tảng phù hợp để mở rộng, không cần viết lại. Rủi ro lớn nhất nằm ở thiếu schema commerce và availability, dữ liệu vận hành còn hard-code, cùng việc form hiện tại mới là yêu cầu tư vấn. Phase 1 phải giải quyết nguồn dữ liệu và quyền truy cập trước; Phase 2–4 mới lần lượt mở cart, checkout và order thật. Cách này giữ nguyên website đang hoạt động và giảm rủi ro sai giá, quá capacity hoặc lộ dữ liệu khách hàng.
