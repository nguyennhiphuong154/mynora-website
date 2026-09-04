# Cập nhật ảnh sản phẩm trên trang chủ MYNORA

Trang chủ dùng một nguồn ảnh tập trung: `app/lib/site-data.ts`, mảng `homeProducts`.

## Thay ảnh cho một sản phẩm

1. Chuẩn bị ảnh vuông, không có chữ hoặc logo chèn trên ảnh.
2. Lưu ảnh vào `public/images/products/` với đúng tên slug hiện có:
   - `coconut-flan.jpg`
   - `gateau-coconut-flan.jpg`
   - `su-kem.jpg`
   - `brownies.jpg`
   - `basque-burnt-cheesecake.jpg`
   - `crepe.jpg`
   - `cookie-hanh-nhan-chocolate-chip.jpg`
   - `tiramisu.jpg`
3. Nếu đổi định dạng hoặc tên file, chỉ cần cập nhật trường `image` trong `homeProducts`; không cần sửa component trang chủ.

Không đổi slug sản phẩm khi chỉ thay ảnh.
