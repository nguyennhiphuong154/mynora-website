import { Page } from "../components/store-shell";
import { getPublicCatalog } from "../lib/catalog";
import { mynoraOperationalCopy } from "../lib/site-data";
import ContactForm from "../lien-he/contact-form";
export const dynamic = "force-dynamic";
function social(value: string | undefined) { try { return value && new URL(value).protocol === "https:" ? value : undefined; } catch { return undefined; } }
export default async function OrderGuide() {
 const products = await getPublicCatalog();
 return <Page eyebrow="ĐẶT BÁNH" title="Một lời hẹn ngọt ngào." intro={mynoraOperationalCopy.preorder}><ContactForm products={products} facebookUrl={social(process.env.MYNORA_FACEBOOK_URL)} instagramUrl={social(process.env.MYNORA_INSTAGRAM_URL)} /></Page>;
}
