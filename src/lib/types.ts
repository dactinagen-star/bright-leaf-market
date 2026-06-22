export type CatalogItem = {
  id: string;
  wallet_address: string;
  name: string;
  description: string | null;
  price_uah: number | null;
  image_url: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  region_id: string | null;
  district_id: string | null;
  address_detail: string | null;
  allow_group_order: boolean | null;
  active: boolean;
  created_at: string;
};

export type Category = { id: string; slug: string; name_uk: string; sort_order: number | null };
export type Subcategory = Category & { category_id: string };
export type Region = { id: string; slug: string; name_uk: string; sort_order: number | null };
export type District = Region & { region_id: string };

export type TelegramLink = {
  wallet_address: string;
  telegram_id: number | null;
  telegram_username: string | null;
};

export type CartLine = {
  product_id: string;
  product_name: string;
  seller_wallet: string;
  seller_telegram_id: number | null;
  seller_telegram_username: string | null;
  price_uah: number;
  image_url: string | null;
  quantity: number;
};