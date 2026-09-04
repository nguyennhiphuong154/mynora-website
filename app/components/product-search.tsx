"use client";

import { useMemo, useState } from "react";
import { catalogProducts } from "../lib/site-data";
import { CatalogCards } from "./catalog-cards";

export function ProductSearch() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("vi");
    if (!needle) return [];
    return catalogProducts.filter((product) => [product.displayName, product.standardName, product.category, product.description].join(" ").toLocaleLowerCase("vi").includes(needle));
  }, [query]);
  return <section className="search-panel"><label htmlFor="product-search">Tìm trong bộ sưu tập</label><input id="product-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ví dụ: tiramisu, cheesecake" />{query && (results.length ? <CatalogCards items={results} /> : <p className="empty-state">Chưa tìm thấy món phù hợp. Bạn thử một tên bánh hoặc danh mục khác nhé.</p>)}</section>;
}
