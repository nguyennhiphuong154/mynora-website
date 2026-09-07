import { getPublicCatalog } from "../../lib/catalog";
export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Page, ProductGrid } from "../../components/store-shell";
import { categories } from "../../lib/site-data";

type CategoryPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> { const { slug } = await params; const category = categories.find((item) => item.slug === slug); return category ? { title: `${category.name} | MYNORA Bakery`, description: category.description, robots: { index: false, follow: true } } : {}; }

export default async function Category({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();
  const items = (await getPublicCatalog()).filter((product) => product.category === slug);
  return <Page eyebrow="DANH MỤC" title={category.name} intro={category.description}>
    <nav className="store-breadcrumb" aria-label="Breadcrumb"><Link href="/">Trang chủ</Link><span>/</span><Link href="/san-pham">Sản phẩm</Link><span>/</span><span aria-current="page">{category.name}</span></nav>
    {items.length ? <ProductGrid items={items} /> : <p className="empty-state">Bộ sưu tập này đang được MYNORA chuẩn bị.</p>}
    <Link className="store-text-link" href="/san-pham">← Xem toàn bộ bộ sưu tập</Link>
  </Page>;
}
