import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "../../lib/supabase/config";
import { mynoraSiteSettings, type CatalogCategory, type CatalogImage, type CatalogProduct, type CatalogVariant } from "../data/site-data";

type ProductRow = Record<string, unknown> & {
  categories: { slug: string; name: string; is_active: boolean };
  product_variants?: Record<string, unknown>[];
  product_images?: Record<string, unknown>[];
};

const numeric = (value: unknown) => value === null || value === undefined ? null : Number(value);

export type PublicSiteSettings = typeof mynoraSiteSettings;

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseConfig();
  const client = createClient(supabaseUrl, supabasePublishableKey, { auth: { persistSession: false }, global: { fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }) } });
  const { data, error } = await client.from("site_settings").select("key,value").eq("is_public", true).in("key", ["contact", "order", "delivery", "privacy"]);
  if (error) return mynoraSiteSettings;
  const values = Object.fromEntries((data ?? []).map(row => [row.key, row.value as Record<string, unknown>]));
  return {
    ...mynoraSiteSettings,
    contact: { ...mynoraSiteSettings.contact, ...(values.contact ?? {}) },
    order: { ...mynoraSiteSettings.order, ...(values.order ?? {}) },
    delivery: { ...mynoraSiteSettings.delivery, ...(values.delivery ?? {}) },
    privacy: { ...mynoraSiteSettings.privacy, ...(values.privacy ?? {}) },
  } as PublicSiteSettings;
}

function imageRows(product: ProductRow): CatalogImage[] {
  const rows = product.product_images ?? [];
  if (!rows.length) return [{ id: `primary-${product.id}`, src: String(product.image_path), alt: `${product.display_name} của MYNORA`, width: 1254, height: 1254, isPrimary: true, sortOrder: 0 }];
  return rows.map(row => ({ id: String(row.id), src: String(row.image_path), alt: String(row.alt_text || `${product.display_name} của MYNORA`), width: Number(row.width || 1254), height: Number(row.height || 1254), isPrimary: Boolean(row.is_primary), sortOrder: Number(row.sort_order || 0) }));
}

export async function getPublicCategories(): Promise<CatalogCategory[]> {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseConfig();
  const client = createClient(supabaseUrl, supabasePublishableKey, { auth: { persistSession: false }, global: { fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }) } });
  const { data, error } = await client.from("categories").select("id,slug,name,description,sort_order").eq("is_active", true).order("sort_order").order("id");
  if (error) throw new Error("Không thể tải danh mục. Vui lòng thử lại sau.");
  return (data ?? []).map(row => ({ id: String(row.id), slug: row.slug, name: row.name, description: row.description, sortOrder: row.sort_order }));
}

export async function getPublicCatalog(): Promise<CatalogProduct[]> {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseConfig();
  const client = createClient(supabaseUrl, supabasePublishableKey, { auth: { persistSession: false }, global: { fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }) } });
  const extended = await client.from("products").select("*, categories!inner(slug,name,is_active), product_variants(id,name,sku,price,compare_price,preparation_time_days,minimum_order,serving_size,sort_order,is_active), product_images(id,image_path,alt_text,width,height,is_primary,sort_order,is_active)").eq("is_archived", false).neq("content_status", "hidden").eq("categories.is_active", true).eq("product_variants.is_active", true).eq("product_images.is_active", true).order("sort_order");
  let rows = extended.data as ProductRow[] | null;
  if (extended.error) {
    const legacy = await client.from("products").select("*, categories!inner(slug,name,is_active)").neq("content_status", "hidden").eq("categories.is_active", true).order("sort_order");
    if (legacy.error) throw new Error("Không thể tải menu. Vui lòng thử lại sau.");
    rows = legacy.data as ProductRow[] | null;
  }
  return (rows ?? []).map(p => {
    const images = imageRows(p).sort((a,b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder);
    const variants: CatalogVariant[] = (p.product_variants ?? []).map(row => ({ id: String(row.id), name: String(row.name), sku: row.sku ? String(row.sku) : null, price: numeric(row.price), comparePrice: numeric(row.compare_price), preparationTimeDays: numeric(row.preparation_time_days), minimumOrder: Number(row.minimum_order || 1), servingSize: String(row.serving_size || ""), sortOrder: Number(row.sort_order || 0) })).sort((a,b) => a.sortOrder - b.sortOrder);
    return ({
    id: String(p.id), slug: String(p.slug), name: String(p.name), displayName: String(p.display_name),
    standardName: String(p.standard_name), shortDescription: String(p.short_description || p.description || ""), category: p.categories.slug, categoryName: p.categories.name, description: String(p.description || ""),
    story: String(p.story || ""), image: String(p.image_path), status: "draft", requirements: Array.isArray(p.requirements) ? p.requirements.map(String) : [],
    basePrice: numeric(p.base_price), comparePrice: numeric(p.compare_price), preparationTimeDays: numeric(p.preparation_time_days), minimumOrder: Number(p.minimum_order || 1), servingSize: String(p.serving_size || ""), storageInstruction: String(p.storage_instruction || ""), allergenInfo: String(p.allergen_info || ""), isFeatured: Boolean(p.is_featured), variants, images,
    contentStatus: p.content_status as CatalogProduct["contentStatus"], orderStatus: p.order_status as CatalogProduct["orderStatus"], faq: [],
    media: { card: { src: images[0].src, alt: images[0].alt, width: images[0].width, height: images[0].height } },
  }) as CatalogProduct; });
}

