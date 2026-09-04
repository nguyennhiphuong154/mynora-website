import Link from "next/link";
import type { Metadata } from "next";
import { Page } from "../components/store-shell";

export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function StoryPage() {
  return <Page tone="editorial" eyebrow="CÂU CHUYỆN MYNORA" title="Câu chuyện đang được viết tiếp." intro="Câu chuyện MYNORA đang được hoàn thiện.">
    <Link className="store-primary-action story-cta" href="/san-pham">Quay lại menu <span aria-hidden="true">↗</span></Link>
  </Page>;
}
