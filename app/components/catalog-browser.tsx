"use client";

import { useMemo, useState } from "react";
import type { CatalogCategory, CatalogProduct } from "../lib/site-data";
import { CatalogCards } from "./catalog-cards";

export function CatalogBrowser({ products: catalogProducts, categories }: { products: CatalogProduct[]; categories: CatalogCategory[] }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const visibleProducts = useMemo(() => activeCategory === "all" ? catalogProducts : catalogProducts.filter((product) => product.category === activeCategory), [activeCategory, catalogProducts]);
  return <section aria-label="Bộ sưu tập bánh"><div className="catalog-filters" role="group" aria-label="Lọc theo danh mục"><button type="button" className={activeCategory === "all" ? "is-active" : undefined} onClick={() => setActiveCategory("all")}>Tất cả</button>{categories.map((category) => <button type="button" key={category.slug} className={activeCategory === category.slug ? "is-active" : undefined} onClick={() => setActiveCategory(category.slug)}>{category.name}</button>)}</div><CatalogCards items={visibleProducts} /></section>;
}
