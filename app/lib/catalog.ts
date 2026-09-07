import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "../../lib/supabase/config";
import type { CatalogProduct } from "../data/site-data";

export async function getPublicCatalog(): Promise<CatalogProduct[]> {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseConfig();
  const client = createClient(supabaseUrl, supabasePublishableKey, { auth: { persistSession: false }, global: { fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }) } });
  const { data, error } = await client.from("products").select("*, categories!inner(slug,is_active)").neq("content_status", "hidden").eq("categories.is_active", true).order("sort_order");
  if (error) throw new Error("Không thể tải menu. Vui lòng thử lại sau.");
  return (data ?? []).map(p => ({
    id: String(p.id), slug: p.slug, name: p.name, displayName: p.display_name,
    standardName: p.standard_name, category: p.categories.slug, description: p.description,
    story: p.story, image: p.image_path, status: "draft", requirements: p.requirements ?? [],
    contentStatus: p.content_status, orderStatus: p.order_status, faq: [],
    media: { card: { src: p.image_path, alt: `${p.display_name} của MYNORA`, width: 1254, height: 1254 } },
  }));
}

