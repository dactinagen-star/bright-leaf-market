import { supabase } from "./supabase";
import type {
  CatalogItem,
  Category,
  Subcategory,
  Region,
  District,
  TelegramLink,
} from "./types";

export type CatalogFilters = {
  search?: string;
  categoryId?: string | null;
  subcategoryId?: string | null;
  regionId?: string | null;
  districtId?: string | null;
  sort?: "by_seller" | "newest" | "price_asc" | "price_desc";
};

export async function fetchCatalog(filters: CatalogFilters): Promise<CatalogItem[]> {
  // Крок 1: беремо wallet_address продавців з прив'язаним Telegram.
  // Без Telegram покупець не зможе зв'язатись із продавцем — таких ховаємо.
  const { data: linkedWallets, error: walletsError } = await supabase
    .from("telegram_links")
    .select("wallet_address");

  if (walletsError) throw walletsError;

  const verifiedWallets = (linkedWallets ?? []).map(
    (r: { wallet_address: string }) => r.wallet_address,
  );

  if (!verifiedWallets.length) return [];

  // Крок 2: каталог тільки серед верифікованих гаманців
  let q = supabase
    .from("catalog_items")
    .select("*")
    .eq("active", true)
    .in("wallet_address", verifiedWallets);

  if (filters.search && filters.search.length >= 3) {
    q = q.ilike("name", `${filters.search}%`);
  }
  if (filters.categoryId) q = q.eq("category_id", filters.categoryId);
  if (filters.subcategoryId) q = q.eq("subcategory_id", filters.subcategoryId);
  if (filters.regionId) q = q.eq("region_id", filters.regionId);
  if (filters.districtId) q = q.eq("district_id", filters.districtId);

  switch (filters.sort) {
    case "price_asc":
      q = q.order("price_uah", { ascending: true, nullsFirst: false });
      break;
    case "price_desc":
      q = q.order("price_uah", { ascending: false, nullsFirst: false });
      break;
    case "newest":
      q = q.order("created_at", { ascending: false });
      break;
    default:
      // by_seller: групуємо на клієнті, але всередині сортуємо за новизною
      q = q.order("wallet_address", { ascending: true }).order("created_at", { ascending: false });
  }

  const { data, error } = await q.limit(200);
  if (error) throw error;
  return (data ?? []) as CatalogItem[];
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function fetchSubcategories(categoryId: string | null): Promise<Subcategory[]> {
  if (!categoryId) return [];
  const { data, error } = await supabase
    .from("subcategories")
    .select("*")
    .eq("category_id", categoryId)
    .order("sort_order", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as Subcategory[];
}

export async function fetchRegions(): Promise<Region[]> {
  const { data, error } = await supabase
    .from("regions")
    .select("*")
    .order("sort_order", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as Region[];
}

export async function fetchDistricts(regionId: string | null): Promise<District[]> {
  if (!regionId) return [];
  const { data, error } = await supabase
    .from("districts")
    .select("*")
    .eq("region_id", regionId)
    .order("sort_order", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as District[];
}

export async function fetchTelegramLinks(wallets: string[]): Promise<Record<string, TelegramLink>> {
  if (!wallets.length) return {};
  const { data, error } = await supabase
    .from("telegram_links")
    .select("*")
    .in("wallet_address", wallets);
  if (error) throw error;
  const map: Record<string, TelegramLink> = {};
  for (const row of (data ?? []) as TelegramLink[]) map[row.wallet_address] = row;
  return map;
}