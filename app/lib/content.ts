import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "../../lib/supabase/config";
import { mynoraPublicContent, type PublicContentSettings, type PublicFaqItem, type PublicGuideCheck, type PublicGuidePage } from "../data/site-data";

const text = (value: unknown, fallback = "") => typeof value === "string" ? value : fallback;
const number = (value: unknown, fallback: number) => typeof value === "number" && Number.isFinite(value) ? value : fallback;
const object = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};

function normalizeFaq(value: unknown): PublicFaqItem[] {
  if (!Array.isArray(value)) return mynoraPublicContent.faq.items.map(item => ({ ...item }));
  return value.map((entry, index) => {
    const row = object(entry);
    return {
      id: text(row.id, `faq-${index + 1}`),
      question: text(row.question),
      answer: text(row.answer),
      isActive: row.isActive !== false,
      sortOrder: number(row.sortOrder, index + 1),
    };
  });
}

function normalizeChecks(value: unknown, fallback: PublicGuideCheck[]): PublicGuideCheck[] {
  if (!Array.isArray(value)) return fallback.map(item => ({ ...item }));
  return value.map((entry, index) => {
    const row = object(entry);
    return { id: text(row.id, `check-${index + 1}`), label: text(row.label), value: text(row.value) };
  });
}

function normalizePages(value: unknown): PublicGuidePage[] {
  const rows = Array.isArray(value) ? value.map(object) : [];
  return mynoraPublicContent.guides.pages.map(fallback => {
    const row = rows.find(item => item.slug === fallback.slug) ?? {};
    return {
      slug: fallback.slug,
      eyebrow: text(row.eyebrow, fallback.eyebrow),
      title: text(row.title, fallback.title),
      intro: text(row.intro, fallback.intro),
      cardTitle: text(row.cardTitle, fallback.cardTitle),
      cardDescription: text(row.cardDescription, fallback.cardDescription),
      sectionTitle: text(row.sectionTitle, fallback.sectionTitle),
      checks: normalizeChecks(row.checks, fallback.checks),
      extraNote: text(row.extraNote, fallback.extraNote),
    };
  });
}

export function normalizePublicContent(value: unknown): PublicContentSettings {
  const root = object(value);
  const faq = object(root.faq);
  const guides = object(root.guides);
  return { faq: { items: normalizeFaq(faq.items) }, guides: { pages: normalizePages(guides.pages) } };
}

export async function getPublicContent(): Promise<PublicContentSettings> {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseConfig();
  const client = createClient(supabaseUrl, supabasePublishableKey, {
    auth: { persistSession: false },
    global: { fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }) },
  });
  const { data, error } = await client.from("site_settings").select("value").eq("key", "content").eq("is_public", true).maybeSingle();
  if (error || !data) return normalizePublicContent(mynoraPublicContent);
  return normalizePublicContent(data.value);
}
