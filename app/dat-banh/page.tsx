import { Page } from "../components/store-shell";
import { getPublicCatalog, getPublicSiteSettings } from "../lib/catalog";
import ContactForm from "../lien-he/contact-form";
export const dynamic = "force-dynamic";
function social(value: string | undefined) { try { return value && new URL(value).protocol === "https:" ? value : undefined; } catch { return undefined; } }
export default async function OrderGuide() {
 const [products, settings] = await Promise.all([getPublicCatalog(), getPublicSiteSettings()]);
 const preorder = `MYNORA làm bánh theo lịch đặt trước để mỗi đơn được chuẩn bị chỉn chu. Bạn vui lòng gửi yêu cầu trước ít nhất ${settings.order.minimumLeadTimeDays} ngày. Ngày và khung giờ nhận bánh sẽ được MYNORA xác nhận theo từng đơn.`;
 return <Page eyebrow="ĐẶT BÁNH" title="Một lời hẹn ngọt ngào." intro={preorder}><ContactForm products={products} minimumLeadTimeDays={settings.order.minimumLeadTimeDays} facebookUrl={social(process.env.MYNORA_FACEBOOK_URL)} instagramUrl={social(process.env.MYNORA_INSTAGRAM_URL)} /></Page>;
}
