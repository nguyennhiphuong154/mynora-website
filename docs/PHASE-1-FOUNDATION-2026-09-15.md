# MYNORA — Phase 1: Foundation

Ngày hoàn tất: 15/09/2026

## Kết quả

- Supabase là nguồn dữ liệu duy nhất cho sản phẩm, danh mục, biến thể, hình ảnh và cấu hình vận hành công khai.
- Giữ nguyên 8 sản phẩm và 4 danh mục hiện có. Toàn bộ sản phẩm vẫn ở trạng thái `coming_soon`.
- Không tự tạo giá, biến thể, thời gian chuẩn bị hoặc thông tin thương mại chưa được MYNORA xác nhận.
- Admin có thể quản lý sản phẩm, danh mục, biến thể và cấu hình vận hành.
- Quyền Admin được xác minh tập trung bằng Supabase Auth và bảng `admin_users`; email chủ sở hữu không còn nằm cứng trong mã phía trình duyệt.
- Màu kem thương hiệu dùng token chung `#FFF7E6`; màu navy và các màu chữ/đường viền cũng dùng token chung.
- Quy tắc đặt trước được đọc từ `site_settings` ở giao diện và Edge Function, với giá trị dự phòng 5 ngày để duy trì hoạt động khi dịch vụ dữ liệu tạm lỗi.

## Cấu trúc dữ liệu

Migration `20260915170000_ecommerce_foundation.sql` bổ sung:

- Thuộc tính thương mại và vận hành cho `products`.
- Bảng `product_variants`.
- Bảng `product_images`.
- Bảng `site_settings`.
- RLS, quyền truy cập, trigger `updated_at` và index cần thiết.

Migration `20260915171500_consolidate_content_policies.sql` hợp nhất các policy đọc/ghi bị trùng trên nội dung và biểu mẫu liên hệ.

Trạng thái dữ liệu sau migration:

| Dữ liệu | Số lượng |
| --- | ---: |
| Sản phẩm | 8 |
| Danh mục | 4 |
| Hình ảnh sản phẩm | 8 |
| Nhóm cấu hình công khai | 4 |
| Biến thể | 0 |
| Sản phẩm có giá hoặc thời gian chuẩn bị tự sinh | 0 |

## Admin

- `/admin/san-pham`: thông tin sản phẩm, trạng thái bán, giá, thời gian chuẩn bị, số lượng tối thiểu, khẩu phần, bảo quản, dị ứng, nổi bật và lưu trữ.
- `/admin/san-pham`: quản lý biến thể với SKU, giá, giá so sánh, thời gian chuẩn bị, số lượng tối thiểu, khẩu phần, tồn kho, thứ tự và trạng thái.
- `/admin/danh-muc`: thêm và chỉnh sửa tên, slug, mô tả, thứ tự và trạng thái danh mục.
- `/admin/van-hanh`: chỉnh sửa thông tin liên hệ, quy tắc đặt trước và giao hàng.

## Kiểm chứng

- `pnpm run typecheck`: đạt.
- `pnpm run lint`: đạt.
- `pnpm test`: đạt 22/22; lệnh bao gồm production build.
- Supabase Security Advisor: không có lỗi RLS; còn một cảnh báo cấp tài khoản về Leaked Password Protection đang tắt.
- Supabase Performance Advisor: không còn policy trùng; các thông báo còn lại là index chưa được dùng do dữ liệu/lưu lượng hiện tại thấp.

## Dữ liệu cần MYNORA xác nhận trước các phase bán hàng

- Giá và giá so sánh của từng sản phẩm/quy cách.
- Danh sách quy cách, SKU, khẩu phần và số lượng tối thiểu.
- Thời gian chuẩn bị riêng cho từng sản phẩm/quy cách.
- Lịch nhận bánh, năng lực theo ngày và ngày nghỉ.
- Thông tin thanh toán, chính sách đổi/hủy/hoàn tiền và đường dẫn mạng xã hội chính thức.

Phase 2 chỉ nên bắt đầu sau khi dữ liệu sản phẩm tối thiểu được xác nhận, để giỏ hàng và checkout không dựa trên dữ liệu giả.
