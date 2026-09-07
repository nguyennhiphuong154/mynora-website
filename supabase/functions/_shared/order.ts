export type OrderInput = {
  customerName: string; phone: string; preferredContactChannel: string;
  items: { productId: string; quantity: number }[];
  requestedDate: string; requestedTimeSlot: string; fulfillmentType: string;
  deliveryAddress: string; differentRecipient: boolean; recipientName: string;
  recipientPhone: string; note: string; consent: boolean; website: string;
};
export function minimumDate(now = new Date(), leadDays = 5) {
  const local = new Date(now.getTime() + 7 * 3600000);
  local.setUTCDate(local.getUTCDate() + leadDays);
  return local.toISOString().slice(0, 10);
}
const phoneValid = (s: string) => /^(0[35789]\d{8}|\+84[35789]\d{8})$/.test(s.replace(/[\s().-]/g, ""));
export function validateOrder(value: unknown, minDate = minimumDate()): { data?: OrderInput; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const v = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const str = (key: string) => typeof v[key] === "string" ? (v[key] as string).trim() : "";
  const data: OrderInput = {
    customerName: str("customerName"), phone: str("phone").replace(/[\s().-]/g, ""), preferredContactChannel: str("preferredContactChannel"),
    items: [], requestedDate: str("requestedDate"), requestedTimeSlot: str("requestedTimeSlot"), fulfillmentType: str("fulfillmentType"),
    deliveryAddress: str("deliveryAddress"), differentRecipient: v.differentRecipient === true,
    recipientName: str("recipientName"), recipientPhone: str("recipientPhone").replace(/[\s().-]/g, ""), note: str("note"), consent: v.consent === true, website: str("website"),
  };
  if (data.customerName.length < 2 || data.customerName.length > 120) errors.customerName = "Vui lòng nhập họ tên từ 2–120 ký tự.";
  if (!phoneValid(data.phone)) errors.phone = "Vui lòng nhập số điện thoại Việt Nam hợp lệ.";
  if (!["phone", "facebook", "instagram"].includes(data.preferredContactChannel)) errors.preferredContactChannel = "Vui lòng chọn kênh liên hệ.";
  if (!Array.isArray(v.items) || v.items.length < 1 || v.items.length > 20) errors.items = "Vui lòng chọn từ 1–20 món bánh.";
  else {
    const seen = new Set<string>();
    v.items.forEach((item: unknown, i: number) => {
      const row = item && typeof item === "object" ? item as Record<string, unknown> : {};
      if (typeof row.productId !== "string" || !/^[1-9]\d*$/.test(row.productId) || seen.has(row.productId)) errors[`items.${i}.productId`] = "Vui lòng chọn món bánh khác nhau.";
      if (!Number.isInteger(row.quantity) || Number(row.quantity) < 1 || Number(row.quantity) > 99) errors[`items.${i}.quantity`] = "Số lượng từ 1–99.";
      if (row.variantId) errors[`items.${i}.productId`] = "Quy cách này không còn hợp lệ.";
      seen.add(String(row.productId)); data.items.push({ productId: String(row.productId ?? ""), quantity: Number(row.quantity) });
    });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.requestedDate) || !Number.isFinite(Date.parse(data.requestedDate)) || new Date(data.requestedDate).toISOString().slice(0, 10) !== data.requestedDate || data.requestedDate < minDate) errors.requestedDate = "Vui lòng chọn ngày nhận cách hôm nay ít nhất 5 ngày.";
  if (!data.requestedTimeSlot || data.requestedTimeSlot.length > 120) errors.requestedTimeSlot = "Vui lòng nhập khung giờ mong muốn (tối đa 120 ký tự).";
  if (!["delivery", "pickup"].includes(data.fulfillmentType)) errors.fulfillmentType = "Vui lòng chọn hình thức nhận bánh.";
  if (data.fulfillmentType === "delivery" && (data.deliveryAddress.length < 5 || data.deliveryAddress.length > 500)) errors.deliveryAddress = "Vui lòng nhập địa chỉ giao bánh đầy đủ (5–500 ký tự).";
  if (data.differentRecipient) {
    if (data.recipientName.length < 2 || data.recipientName.length > 120) errors.recipientName = "Vui lòng nhập tên người nhận (2–120 ký tự).";
    if (!phoneValid(data.recipientPhone)) errors.recipientPhone = "Vui lòng nhập số điện thoại người nhận hợp lệ.";
  } else { data.recipientName = ""; data.recipientPhone = ""; }
  if (data.fulfillmentType === "pickup") data.deliveryAddress = "";
  if (data.note.length > 5000) errors.note = "Ghi chú tối đa 5.000 ký tự.";
  if (!data.consent) errors.consent = "Vui lòng đồng ý để MYNORA liên hệ xác nhận.";
  if (data.website) errors.website = "Không thể gửi yêu cầu.";
  return Object.keys(errors).length ? { errors } : { data, errors };
}

export type SavedOrder = { id: string; created_at: string; payload: OrderInput; items: { productId: string; productNameSnapshot: string; quantity: number }[] };
export function orderEmail(order: SavedOrder) {
  const p = order.payload;
  return { subject: `[MYNORA] Yêu cầu đặt bánh mới - ${p.customerName.replace(/[\r\n]/g, " ")}`,
    text: ["MYNORA · YÊU CẦU ĐẶT BÁNH", `Mã yêu cầu: MYN-${order.id}`, "Trạng thái: Chờ MYNORA xác nhận", "", `Họ tên: ${p.customerName}`, `Điện thoại: ${p.phone}`, `Kênh liên hệ: ${{ phone: "Điện thoại", facebook: "Facebook", instagram: "Instagram" }[p.preferredContactChannel as "phone"]}`, "", "BÁNH KHÁCH ĐẶT", ...order.items.map(i => `${i.productNameSnapshot} × ${i.quantity}`), "", `Ngày nhận: ${p.requestedDate}`, `Khung giờ: ${p.requestedTimeSlot}`, `Nhận bánh: ${p.fulfillmentType === "delivery" ? "Giao hàng" : "Tự đến nhận"}`, ...(p.fulfillmentType === "delivery" ? [`Địa chỉ: ${p.deliveryAddress}`] : []), ...(p.differentRecipient ? [`Người nhận: ${p.recipientName}`, `Điện thoại người nhận: ${p.recipientPhone}`] : []), "", `Ghi chú: ${p.note || "Không có"}`, `Gửi lúc: ${order.created_at}`].join("\n") };
}
