export type ContentStatus = "verified" | "safe_draft" | "needs_confirmation" | "hidden";

/** Public operational data approved by MYNORA. Keep private location data out. */
export const mynoraSiteSettings = {
  brandName: "MYNORA",
  contact: {
    phone: "0763722023",
    phoneHasZalo: true,
    email: "mynorabakery@gmail.com",
    facebookLabel: "MYNORA bakery",
    facebookUrl: undefined,
    instagramUrl: undefined,
    tiktokUrl: undefined,
    contactHours: "Thứ Hai–Chủ nhật, 8:00–20:00",
  },
  order: {
    minimumLeadTimeDays: 5,
    urgentOrdersAccepted: false,
    confirmationChannels: ["phone", "facebook"],
    expectedReplyMinutes: 15,
    receivingWindowNoticeDays: 2,
    eventOrdersAccepted: false,
    largeOrdersAccepted: false,
  },
  delivery: {
    enabled: true,
    areaLabel: "Đà Nẵng",
    freeRadiusKm: 5,
    feeOutsideFreeRadiusVnd: 10000,
    customerSelectsTimeWindowOnly: true,
    driverBookedBy: "MYNORA",
  },
  privacy: {
    showKitchenLocation: false,
    showPickupAddress: false,
    showMap: false,
  },
} as const;

export const mynoraOperationalCopy = {
  preorder: "MYNORA làm bánh theo lịch đặt trước để mỗi đơn được chuẩn bị chỉn chu. Bạn vui lòng gửi yêu cầu trước ít nhất 5 ngày. Ngày và khung giờ nhận bánh sẽ được MYNORA xác nhận theo từng đơn.",
  delivery: "MYNORA giao bánh tại Đà Nẵng. Miễn phí trong phạm vi tối đa 5 km; với khoảng cách trên 5 km, phí giao hiện tại là 10.000đ và được xác nhận khi chốt đơn.",
  receiving: "Khung giờ nhận bánh cụ thể sẽ được MYNORA thông báo trước 2 ngày.",
  storage: "Bảo quản bánh trong ngăn mát tủ lạnh và dùng sớm sau khi nhận để giữ trải nghiệm tốt nhất.",
  issue: "Vui lòng kiểm tra bánh ngay khi nhận. Nếu có vấn đề, hãy giữ lại hình ảnh hoặc video và liên hệ MYNORA để được kiểm tra theo từng trường hợp.",
} as const;

export const publicOrderFaqs = [
  { question: "Tôi cần đặt bánh trước bao lâu?", answer: "Bạn vui lòng gửi yêu cầu trước ít nhất 5 ngày để MYNORA sắp xếp lịch làm bánh." },
  { question: "MYNORA có nhận đơn trong ngày không?", answer: "Hiện MYNORA chưa nhận đơn gấp hoặc đơn trong ngày." },
  { question: "Khi nào tôi biết khung giờ nhận bánh?", answer: "Khung giờ nhận bánh cụ thể sẽ được MYNORA thông báo trước 2 ngày." },
  { question: "MYNORA phản hồi yêu cầu đặt bánh trong bao lâu?", answer: "Trong khung giờ tiếp nhận 8:00–20:00, MYNORA dự kiến phản hồi trong khoảng 15 phút." },
  { question: "MYNORA có giao bánh tại Đà Nẵng không?", answer: "Có. MYNORA nhận giao bánh trong khu vực Đà Nẵng và sẽ xác nhận khung giờ theo từng đơn." },
  { question: "Phí giao hàng được tính như thế nào?", answer: "MYNORA miễn phí giao trong phạm vi tối đa 5 km. Với khoảng cách trên 5 km, phí giao hiện tại là 10.000đ và sẽ được xác nhận khi chốt đơn." },
  { question: "Tôi có được chọn giờ giao chính xác không?", answer: "Khách có thể chọn khung giờ. Thời điểm giao cụ thể sẽ được MYNORA xác nhận theo lịch đơn." },
  { question: "Tôi cần làm gì khi nhận bánh?", answer: "Vui lòng kiểm tra bánh ngay khi nhận. Nếu có vấn đề, hãy giữ lại hình ảnh hoặc video và liên hệ MYNORA." },
  { question: "Bảo quản bánh như thế nào?", answer: "Bảo quản trong ngăn mát tủ lạnh và dùng sớm sau khi nhận. Hướng dẫn chi tiết theo từng món sẽ được MYNORA bổ sung khi hoàn thiện." },
  { question: "MYNORA có nhận bánh sinh nhật hoặc đơn số lượng lớn không?", answer: "Hiện MYNORA chưa nhận bánh sinh nhật, bánh sự kiện hoặc đơn số lượng lớn." },
] as const;

export type CatalogProduct = {
 slug: string; name: string; category: string; description: string; story: string; image: string; status: string; requirements: readonly string[];
  id: string;
  displayName: string;
  standardName: string;
  shortDescription: string;
  categoryName: string;
  basePrice: number | null;
  comparePrice: number | null;
  preparationTimeDays: number | null;
  minimumOrder: number;
  servingSize: string;
  storageInstruction: string;
  allergenInfo: string;
  isFeatured: boolean;
  variants: readonly CatalogVariant[];
  images: readonly CatalogImage[];
  contentStatus: ContentStatus;
  orderStatus: "coming_soon" | "available" | "paused" | "sold_out";
  media: { card: { src: string; alt: string; width: number; height: number } };
  faq: ReadonlyArray<{ question: string; answer: string; status: ContentStatus }>;
};

export type CatalogCategory = { id: string; slug: string; name: string; description: string; sortOrder: number };
export type CatalogVariant = { id: string; name: string; sku: string | null; price: number | null; comparePrice: number | null; preparationTimeDays: number | null; minimumOrder: number; servingSize: string; sortOrder: number };
export type CatalogImage = { id: string; src: string; alt: string; width: number; height: number; isPrimary: boolean; sortOrder: number };

export const guides = [
  ["/huong-dan-dat-banh", "Cách đặt bánh", "Gửi yêu cầu trước ít nhất 5 ngày và nhận xác nhận từ MYNORA."],
  ["/giao-hang-va-nhan-banh", "Giao hàng & nhận bánh", "Thông tin giao tận nơi tại Đà Nẵng và khung giờ nhận bánh."],
  ["/bao-quan-banh", "Bảo quản bánh", "Bảo quản trong ngăn mát và dùng sớm sau khi nhận."],
  ["/cau-hoi-thuong-gap", "Câu hỏi thường gặp", "Những câu trả lời nhanh trước khi đặt bánh."],
] as const;

export type PublicFaqItem = { id: string; question: string; answer: string; isActive: boolean; sortOrder: number };
export type PublicGuideCheck = { id: string; label: string; value: string };
export type PublicGuidePage = { slug: string; eyebrow: string; title: string; intro: string; cardTitle: string; cardDescription: string; sectionTitle: string; checks: PublicGuideCheck[]; extraNote: string };
export type PublicContentSettings = { faq: { items: PublicFaqItem[] }; guides: { pages: PublicGuidePage[] } };

/** Safe local fallback used only when public content cannot be read from Supabase. */
export const mynoraPublicContent: PublicContentSettings = {
  faq: {
    items: publicOrderFaqs.map((item, index) => ({ id: `faq-${index + 1}`, ...item, isActive: true, sortOrder: index + 1 })),
  },
  guides: {
    pages: [
      { slug: "huong-dan-dat-banh", eyebrow: "HƯỚNG DẪN", title: "Đặt bánh cùng MYNORA", intro: mynoraOperationalCopy.preorder, cardTitle: "Cách đặt bánh", cardDescription: "Gửi yêu cầu trước ít nhất 5 ngày và nhận xác nhận từ MYNORA.", sectionTitle: "Trước khi gửi yêu cầu.", checks: [{ id: "preorder-1", label: "Đặt trước", value: "Ít nhất 5 ngày" }, { id: "preorder-2", label: "Đơn gấp", value: "MYNORA chưa nhận đơn trong ngày" }, { id: "preorder-3", label: "Xác nhận", value: "Qua điện thoại hoặc Facebook" }, { id: "preorder-4", label: "Khung giờ nhận", value: "Thông báo trước 2 ngày" }], extraNote: "" },
      { slug: "giao-hang-va-nhan-banh", eyebrow: "GIAO HÀNG", title: "Giao hàng & nhận bánh", intro: mynoraOperationalCopy.delivery, cardTitle: "Giao hàng & nhận bánh", cardDescription: "Thông tin giao tận nơi tại Đà Nẵng và khung giờ nhận bánh.", sectionTitle: "Trước khi gửi yêu cầu.", checks: [{ id: "delivery-1", label: "Khu vực phục vụ", value: "Đà Nẵng" }, { id: "delivery-2", label: "Trong phạm vi tối đa 5 km", value: "Miễn phí giao hàng" }, { id: "delivery-3", label: "Trên 5 km", value: "10.000đ, xác nhận khi chốt đơn" }, { id: "delivery-4", label: "Khung giờ", value: "Khách chọn khung giờ, MYNORA xác nhận thời điểm cụ thể" }], extraNote: mynoraOperationalCopy.issue },
      { slug: "bao-quan-banh", eyebrow: "HƯỚNG DẪN", title: "Bảo quản bánh", intro: mynoraOperationalCopy.storage, cardTitle: "Bảo quản bánh", cardDescription: "Bảo quản trong ngăn mát và dùng sớm sau khi nhận.", sectionTitle: "Trước khi gửi yêu cầu.", checks: [{ id: "storage-1", label: "Bảo quản chung", value: "Ngăn mát tủ lạnh" }, { id: "storage-2", label: "Thưởng thức", value: "Dùng sớm sau khi nhận" }, { id: "storage-3", label: "Hạn dùng", value: "MYNORA sẽ bổ sung theo từng món" }, { id: "storage-4", label: "Lưu ý", value: "Kiểm tra hướng dẫn riêng khi sản phẩm được hoàn thiện" }], extraNote: "" },
      { slug: "cau-hoi-thuong-gap", eyebrow: "HỖ TRỢ", title: "Câu hỏi thường gặp", intro: "Những thông tin MYNORA đã xác nhận trước khi bạn gửi yêu cầu đặt bánh.", cardTitle: "Câu hỏi thường gặp", cardDescription: "Những câu trả lời nhanh trước khi đặt bánh.", sectionTitle: "", checks: [], extraNote: "" },
    ],
  },
};

export const policies = ["dat-hang", "giao-hang", "doi-huy-hoan-tien", "quyen-rieng-tu", "dieu-khoan-su-dung"] as const;

export const orderStatusLabels = { available: "Nhận yêu cầu đặt bánh", coming_soon: "Chưa mở bán", paused: "Tạm ngừng nhận", sold_out: "Tạm hết bánh" };
