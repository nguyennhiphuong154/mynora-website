"use client";

/* eslint-disable @next/next/no-img-element -- Product media is locally hosted and content-managed. */
import Link from "next/link";
import { type CatalogProduct } from "../lib/site-data";

export function CatalogCards({ items }: { items: readonly CatalogProduct[] }) {
  return <div className="catalog-grid">{items.map((product, index) => <article className="catalog-card" key={product.slug}>
    <Link className="catalog-card-image" href={`/san-pham/${product.slug}`} aria-label={`Xem ${product.displayName}`}><span>0{index + 1}</span><img src={product.media.card.src} alt={product.media.card.alt} width={product.media.card.width} height={product.media.card.height} loading="lazy" /></Link>
    <div className="catalog-card-copy"><p>{product.standardName}</p><h2><Link href={`/san-pham/${product.slug}`}>{product.displayName}</Link></h2><span className="product-coming-soon">Đang hoàn thiện thông tin mở bán</span><Link className="catalog-card-link" href={`/san-pham/${product.slug}`}>Xem chi tiết <i aria-hidden="true">↗</i></Link></div>
  </article>)}</div>;
}
