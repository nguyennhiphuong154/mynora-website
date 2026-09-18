insert into public.site_settings (key, value, is_public, description)
values (
  'content',
  $json$
  {
    "faq": {
      "items": [
        {"id":"faq-1","question":"Tôi cần đặt bánh trước bao lâu?","answer":"Bạn vui lòng gửi yêu cầu trước ít nhất 5 ngày để MYNORA sắp xếp lịch làm bánh.","isActive":true,"sortOrder":1},
        {"id":"faq-2","question":"MYNORA có nhận đơn trong ngày không?","answer":"Hiện MYNORA chưa nhận đơn gấp hoặc đơn trong ngày.","isActive":true,"sortOrder":2},
        {"id":"faq-3","question":"Khi nào tôi biết khung giờ nhận bánh?","answer":"Khung giờ nhận bánh cụ thể sẽ được MYNORA thông báo trước 2 ngày.","isActive":true,"sortOrder":3},
        {"id":"faq-4","question":"MYNORA phản hồi yêu cầu đặt bánh trong bao lâu?","answer":"Trong khung giờ tiếp nhận 8:00–20:00, MYNORA dự kiến phản hồi trong khoảng 15 phút.","isActive":true,"sortOrder":4},
        {"id":"faq-5","question":"MYNORA có giao bánh tại Đà Nẵng không?","answer":"Có. MYNORA nhận giao bánh trong khu vực Đà Nẵng và sẽ xác nhận khung giờ theo từng đơn.","isActive":true,"sortOrder":5},
        {"id":"faq-6","question":"Phí giao hàng được tính như thế nào?","answer":"MYNORA miễn phí giao trong phạm vi tối đa 5 km. Với khoảng cách trên 5 km, phí giao hiện tại là 10.000đ và sẽ được xác nhận khi chốt đơn.","isActive":true,"sortOrder":6},
        {"id":"faq-7","question":"Tôi có được chọn giờ giao chính xác không?","answer":"Khách có thể chọn khung giờ. Thời điểm giao cụ thể sẽ được MYNORA xác nhận theo lịch đơn.","isActive":true,"sortOrder":7},
        {"id":"faq-8","question":"Tôi cần làm gì khi nhận bánh?","answer":"Vui lòng kiểm tra bánh ngay khi nhận. Nếu có vấn đề, hãy giữ lại hình ảnh hoặc video và liên hệ MYNORA.","isActive":true,"sortOrder":8},
        {"id":"faq-9","question":"Bảo quản bánh như thế nào?","answer":"Bảo quản trong ngăn mát tủ lạnh và dùng sớm sau khi nhận. Hướng dẫn chi tiết theo từng món sẽ được MYNORA bổ sung khi hoàn thiện.","isActive":true,"sortOrder":9},
        {"id":"faq-10","question":"MYNORA có nhận bánh sinh nhật hoặc đơn số lượng lớn không?","answer":"Hiện MYNORA chưa nhận bánh sinh nhật, bánh sự kiện hoặc đơn số lượng lớn.","isActive":true,"sortOrder":10}
      ]
    },
    "guides": {
      "pages": [
        {
          "slug":"huong-dan-dat-banh",
          "eyebrow":"HƯỚNG DẪN",
          "title":"Đặt bánh cùng MYNORA",
          "intro":"MYNORA làm bánh theo lịch đặt trước để mỗi đơn được chuẩn bị chỉn chu. Bạn vui lòng gửi yêu cầu trước ít nhất 5 ngày. Ngày và khung giờ nhận bánh sẽ được MYNORA xác nhận theo từng đơn.",
          "cardTitle":"Cách đặt bánh",
          "cardDescription":"Gửi yêu cầu trước ít nhất 5 ngày và nhận xác nhận từ MYNORA.",
          "sectionTitle":"Trước khi gửi yêu cầu.",
          "checks":[{"id":"preorder-1","label":"Đặt trước","value":"Ít nhất 5 ngày"},{"id":"preorder-2","label":"Đơn gấp","value":"MYNORA chưa nhận đơn trong ngày"},{"id":"preorder-3","label":"Xác nhận","value":"Qua điện thoại hoặc Facebook"},{"id":"preorder-4","label":"Khung giờ nhận","value":"Thông báo trước 2 ngày"}],
          "extraNote":""
        },
        {
          "slug":"giao-hang-va-nhan-banh",
          "eyebrow":"GIAO HÀNG",
          "title":"Giao hàng & nhận bánh",
          "intro":"MYNORA giao bánh tại Đà Nẵng. Miễn phí trong phạm vi tối đa 5 km; với khoảng cách trên 5 km, phí giao hiện tại là 10.000đ và được xác nhận khi chốt đơn.",
          "cardTitle":"Giao hàng & nhận bánh",
          "cardDescription":"Thông tin giao tận nơi tại Đà Nẵng và khung giờ nhận bánh.",
          "sectionTitle":"Trước khi gửi yêu cầu.",
          "checks":[{"id":"delivery-1","label":"Khu vực phục vụ","value":"Đà Nẵng"},{"id":"delivery-2","label":"Trong phạm vi tối đa 5 km","value":"Miễn phí giao hàng"},{"id":"delivery-3","label":"Trên 5 km","value":"10.000đ, xác nhận khi chốt đơn"},{"id":"delivery-4","label":"Khung giờ","value":"Khách chọn khung giờ, MYNORA xác nhận thời điểm cụ thể"}],
          "extraNote":"Vui lòng kiểm tra bánh ngay khi nhận. Nếu có vấn đề, hãy giữ lại hình ảnh hoặc video và liên hệ MYNORA để được kiểm tra theo từng trường hợp."
        },
        {
          "slug":"bao-quan-banh",
          "eyebrow":"HƯỚNG DẪN",
          "title":"Bảo quản bánh",
          "intro":"Bảo quản bánh trong ngăn mát tủ lạnh và dùng sớm sau khi nhận để giữ trải nghiệm tốt nhất.",
          "cardTitle":"Bảo quản bánh",
          "cardDescription":"Bảo quản trong ngăn mát và dùng sớm sau khi nhận.",
          "sectionTitle":"Trước khi gửi yêu cầu.",
          "checks":[{"id":"storage-1","label":"Bảo quản chung","value":"Ngăn mát tủ lạnh"},{"id":"storage-2","label":"Thưởng thức","value":"Dùng sớm sau khi nhận"},{"id":"storage-3","label":"Hạn dùng","value":"MYNORA sẽ bổ sung theo từng món"},{"id":"storage-4","label":"Lưu ý","value":"Kiểm tra hướng dẫn riêng khi sản phẩm được hoàn thiện"}],
          "extraNote":""
        },
        {
          "slug":"cau-hoi-thuong-gap",
          "eyebrow":"HỖ TRỢ",
          "title":"Câu hỏi thường gặp",
          "intro":"Những thông tin MYNORA đã xác nhận trước khi bạn gửi yêu cầu đặt bánh.",
          "cardTitle":"Câu hỏi thường gặp",
          "cardDescription":"Những câu trả lời nhanh trước khi đặt bánh.",
          "sectionTitle":"",
          "checks":[],
          "extraNote":""
        }
      ]
    }
  }
  $json$::jsonb,
  true,
  'FAQ và nội dung hướng dẫn có thể chỉnh sửa từ Admin'
)
on conflict (key) do nothing;
