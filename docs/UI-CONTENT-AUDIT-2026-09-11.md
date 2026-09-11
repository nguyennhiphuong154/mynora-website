# Rà soát giao diện và nội dung MYNORA — 11/09/2026

Đã sửa:
- Thay menu mobile trang chủ và trang con bằng dialog nền #FFF7E6: nằm trên lớp header/ảnh, chặn tương tác nền, cuộn độc lập, Escape và trả focus về nút mở menu.
- Chỉnh khoảng cách dòng tiêu đề tiếng Việt và chữ nhỏ trên thẻ bánh; tránh email tràn chân trang.
- Thêm nút dừng ảnh hero/dải bánh, tôn trọng giảm chuyển động; sửa điều khiển tràn màn hình 320 px.
- Đồng bộ hướng dẫn với form /dat-banh, sửa CTA đi sai trang; bỏ thông báo giỏ hàng/checkout/tra cứu gây hiểu lầm.
- Đường dẫn thành công cũ không còn tự khẳng định đã nhận đơn khi chưa xác minh.
- Thay trang câu chuyện trống bằng thông tin đã có về tiệm và quy trình đặt trước; bỏ số lượng sản phẩm cố định trong mô tả menu.

Kiểm tra:
- Crawl 29 URL từ liên kết công khai (gồm 8 trang chi tiết và 4 danh mục): HTTP 200, mỗi trang một H1. 12 nguồn ảnh trong HTML tải thành công.
- Kiểm tra bổ sung tìm kiếm, chỉ mục chính sách, các chính sách còn lại, chuyển hướng admin và trang không tồn tại.
- Browser: menu ở 320×568 và 390×844; menu trang con; Escape/focus, nền modal đúng màu; form giao hàng/người nhận không tràn; lọc Cheesecake trả một món; tìm flan trả hai món, tìm không khớp có thông báo; chi tiết sản phẩm; desktop 1440×900; nút dừng hero/dải bánh.
- Typecheck, ESLint, 13 kiểm thử hiện có và Next production build đạt. Kiểm thử không tạo đơn thật hoặc gửi email.

Cần chủ tiệm hoàn thiện:
- Cả 8 món đang Chưa mở bán: form không thể gửi đơn cho đến khi mở nhận yêu cầu và xác nhận quy cách/giá/lịch.
- Chính sách đặt hàng/giao hàng/đổi hủy/quyền riêng tư/điều khoản vẫn là bản khung; cần nội dung chính thức. Không tự đặt điều kiện thương mại.
- Nhật ký bếp chưa có bài xuất bản. Trang đơn hàng riêng và tra cứu tự động chưa được triển khai.
- Chưa có URL Facebook/Instagram chính thức. Email nhận đơn mong muốn: nguyennhiphuong154@gmail.com; cấu hình nhà cung cấp email production chưa được xác minh trong lần rà soát này.
- Một số trang giữ noindex; sitemap.xml và robots.txt chưa có. Thẻ xác minh Google được giữ nguyên.
- Chưa có phiên admin đăng nhập để thử mọi màn hình quản trị; không coi kiểm thử mã nguồn đăng xuất là kiểm tra đầy đủ phiên đăng nhập thực tế.
- Hero và dải bánh nổi bật vẫn dùng danh sách ảnh biên tập sẵn; khi thay đổi danh mục cần đồng bộ các liên kết này.

Phạm vi: rà soát nguồn toàn bộ các nhóm trang, crawl liên kết công khai và kiểm tra tương tác các mẫu giao diện chính; không khẳng định đã thử mọi thiết bị hay thao tác quản trị.
