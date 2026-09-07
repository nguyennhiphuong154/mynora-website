import { getPublicCatalog } from "../lib/catalog";
export const dynamic = "force-dynamic";
import { ProductSearch } from "../components/product-search";
import { Page } from "../components/store-shell";

export default async function Search() { return <Page eyebrow="TÌM KIẾM" title="Tìm món bánh bạn đang cần." intro="Tìm theo tên hiển thị, tên tiêu chuẩn hoặc danh mục."><ProductSearch products={await getPublicCatalog()} /></Page>; }
