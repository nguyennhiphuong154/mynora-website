export const categories = [
  { slug: "banh-lanh-trang-mieng", name: "Bánh lạnh & tráng miệng", description: "Flan, gâteau flan và tiramisu dịu nhẹ." },
  { slug: "cheesecake", name: "Cheesecake", description: "Các phiên bản cheesecake béo mượt, thơm nhẹ." },
  { slug: "banh-nuong", name: "Bánh nướng", description: "Brownies, cookie và những mẻ bánh nướng chỉn chu." },
  { slug: "banh-tuoi", name: "Bánh tươi", description: "Su kem, crêpe và các món dùng tươi." },
] as const;

const draftRequirements = ["Quy cách và giá", "Thời gian đặt trước", "Bảo quản và hạn dùng", "Thông tin dị ứng"] as const;

export const products = [
  { slug: "coconut-flan", name: "Coconut Flan", category: "banh-lanh-trang-mieng", description: "Flan dừa mềm mịn, thơm dịu.", story: "Một phần flan mềm mịn với dấu ấn dừa dịu nhẹ, dành cho những lúc bạn muốn một món tráng miệng vừa đủ.", image: "z8076971009862_56cc694a15a3e047169718636e145492.jpg", status: "draft", requirements: draftRequirements },
  { slug: "gateau-coconut-flan", name: "Gâteau Coconut Flan", category: "banh-lanh-trang-mieng", description: "Bánh bông lan kết hợp flan béo mịn.", story: "Hai kết cấu trong một miếng bánh: lớp flan mượt và cốt gâteau mềm, kết nối bằng hương dừa đặc trưng của MYNORA.", image: "z8076971039171_962d822a3259b7fd8c82571af94eda06.jpg", status: "draft", requirements: draftRequirements },
  { slug: "su-kem", name: "Su kem", category: "banh-tuoi", description: "Vỏ su nhẹ, nhân kem tan mềm.", story: "Vỏ bánh nhỏ gọn ôm phần kem mịn bên trong, phù hợp để chia sẻ hoặc dùng trong những buổi gặp mặt nhỏ.", image: "z8076971045135_40694c7f2d4424f7bcb3565f55075422.jpg", status: "draft", requirements: draftRequirements },
  { slug: "brownies", name: "Brownies", category: "banh-nuong", description: "Chocolate đậm vị, kết cấu đang được MYNORA hoàn thiện thông tin.", story: "Brownies đậm vị chocolate, được cắt thành phần vừa vặn để dùng riêng hoặc chia sẻ.", image: "z8076971062109_d417dabfa8dcdb1adc6ef54643c14aee.jpg", status: "draft", requirements: draftRequirements },
  { slug: "basque-burnt-cheesecake", name: "Basque Burnt Cheesecake", category: "cheesecake", description: "Mặt bánh nướng sẫm, phần cheesecake cần MYNORA xác nhận thông tin.", story: "Lớp mặt nướng sẫm tạo hương thơm đặc trưng; thông tin chi tiết về phần cheesecake đang được MYNORA hoàn thiện.", image: "z8076971079730_bf7267e0ef529e579804cf686d9e7081.jpg", status: "draft", requirements: draftRequirements },
  { slug: "crepe", name: "Crêpe", category: "banh-tuoi", description: "Dòng crêpe đang chờ MYNORA chốt kiểu bánh và quy cách.", story: "MYNORA đang hoàn thiện mô tả cho dòng crêpe sau khi chốt loại bánh và cách phục vụ.", image: "z8076971116244_bc123a77dd7bac781f6f62b7e996444e.jpg", status: "draft", requirements: ["Loại crêpe", ...draftRequirements] },
  { slug: "cookie-hanh-nhan-chocolate-chip", name: "Cookie hạnh nhân chocolate chip", category: "banh-nuong", description: "Cookie chocolate chip kết hợp hạnh nhân; kết cấu đang được xác nhận.", story: "Cookie chocolate chip kết hợp hạnh nhân, được MYNORA hoàn thiện thông tin về kết cấu và quy cách đóng hộp.", image: "z8076971129600_98c4d14bd136780344e39bc6f8bc9d15.jpg", status: "draft", requirements: draftRequirements },
  { slug: "tiramisu", name: "Tiramisu", category: "banh-lanh-trang-mieng", description: "Cà phê và mascarpone cân bằng, mềm mượt.", story: "Tiramisu với các lớp kem và cốt bánh thấm cà phê, hoàn thiện bằng cacao cho hậu vị cân bằng.", image: "z8076971140093_ec69d0056f14287c6bfca5cf57b5d7c0.jpg", status: "draft", requirements: draftRequirements },
] as const;

export type Product = (typeof products)[number];

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
  contentStatus: ContentStatus;
  orderStatus: "coming_soon" | "available" | "paused" | "sold_out";
  media: { card: { src: string; alt: string; width: number; height: number } };
  faq: ReadonlyArray<{ question: string; answer: string; status: ContentStatus }>;
};

const homeDisplayNames: Record<Product["slug"], string> = {
  "coconut-flan": "Flan Dừa Mây",
  "gateau-coconut-flan": "Gâteau Dừa Caramel",
  "su-kem": "Su Kem Mây",
  brownies: "Brownie Nâu Đậm",
  "basque-burnt-cheesecake": "Basque Cháy Mịn",
  crepe: "Crêpe Kem Mây",
  "cookie-hanh-nhan-chocolate-chip": "Navy Chip Cookie",
  tiramisu: "Tiramisu Đêm Xanh",
};

const standardNames: Record<Product["slug"], string> = {
  "coconut-flan": "Coconut Flan",
  "gateau-coconut-flan": "Gâteau Coconut Flan",
  "su-kem": "Cream Puff",
  brownies: "Chocolate Brownie",
  "basque-burnt-cheesecake": "Basque Burnt Cheesecake",
  crepe: "Mille Crêpe",
  "cookie-hanh-nhan-chocolate-chip": "Almond Chocolate Chip Cookie",
  tiramisu: "Tiramisu",
};

const productFaq = [
  { question: "Khi nào có thể đặt món này?", answer: "MYNORA sẽ cập nhật lịch nhận bánh sau khi hoàn thiện thông tin vận hành cho từng món.", status: "safe_draft" },
  { question: "Có những quy cách nào?", answer: "Quy cách sẽ được giới thiệu cùng giá sau khi MYNORA xác nhận đầy đủ.", status: "safe_draft" },
] as const;

/**
 * Single source of truth for product-facing copy and media. Operational data
 * intentionally stays absent until MYNORA verifies it.
 */
export const catalogProducts: readonly CatalogProduct[] = products.map((product) => ({
  ...product,
  id: product.slug,
  displayName: homeDisplayNames[product.slug],
  standardName: standardNames[product.slug],
  contentStatus: "safe_draft",
  orderStatus: "coming_soon",
  media: {
    card: {
      src: `/images/products/${product.slug}.jpg`,
      alt: `${homeDisplayNames[product.slug]} của MYNORA`,
      width: 1254,
      height: 1254,
    },
  },
  faq: productFaq,
}));

/** No product is open for self-service checkout until pricing and capacity are confirmed. */
export const orderableProducts = catalogProducts.filter((product) => product.orderStatus === "available");

export function getCatalogProduct(slug: string) {
  return catalogProducts.find((product) => product.slug === slug);
}

/**
 * Homepage-only presentation data. Keep product slugs and image paths in one
 * place so a future image refresh does not require component changes.
 */
export const homeProducts = products.map((product) => ({
  ...product,
  displayName: homeDisplayNames[product.slug],
  image: `products/${product.slug}.jpg`,
  imageAlt: `${homeDisplayNames[product.slug]} của MYNORA`,
}));

/**
 * Full-screen hero presentation data. Updating a hero image only requires
 * changing this source of truth; the slider behaviour stays untouched.
 */
export const homeHeroSlides = homeProducts.map((product) => ({
  id: product.slug,
  name: product.displayName,
  alt: product.imageAlt,
  href: `/san-pham/${product.slug}`,
  desktopImage: `/images/hero/${product.slug}-hero.png`,
  mobileImage: `/images/hero/${product.slug}-hero-mobile.png`,
}));

/**
 * The continuously scrolling featured-cake rail uses genuine alpha PNGs.
 * Keep the product identity and image path here so a photography refresh never
 * requires a separate, hard-coded component list.
 */
export const featuredCakes = homeProducts.map((product) => ({
  id: product.slug,
  name: product.displayName,
  alt: product.imageAlt,
  href: `/san-pham/${product.slug}`,
  image: `/images/products/${product.slug}.jpg`,
}));

export const guides = [
  ["/huong-dan-dat-banh", "Cách đặt bánh", "Gửi yêu cầu trước ít nhất 5 ngày và nhận xác nhận từ MYNORA."],
  ["/giao-hang-va-nhan-banh", "Giao hàng & nhận bánh", "Thông tin giao tận nơi tại Đà Nẵng và khung giờ nhận bánh."],
  ["/bao-quan-banh", "Bảo quản bánh", "Bảo quản trong ngăn mát và dùng sớm sau khi nhận."],
  ["/cau-hoi-thuong-gap", "Câu hỏi thường gặp", "Những câu trả lời nhanh trước khi đặt bánh."],
] as const;

export const policies = ["dat-hang", "giao-hang", "doi-huy-hoan-tien", "quyen-rieng-tu", "dieu-khoan-su-dung"] as const;

export const orderStatusLabels = { available: "Nhận yêu cầu đặt bánh", coming_soon: "Chưa mở bán", paused: "Tạm ngừng nhận", sold_out: "Tạm hết bánh" };
