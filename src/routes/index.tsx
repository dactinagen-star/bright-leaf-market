import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Store, LayoutGrid, ArrowLeft, MessageCircle } from "lucide-react";
import { AdsBanner } from "@/components/AdsBanner";
import { Filters, type FilterState } from "@/components/Filters";
import { ProductCard } from "@/components/ProductCard";
import { SellerCard } from "@/components/SellerCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchCatalog,
  fetchCategories,
  fetchDistricts,
  fetchRegions,
  fetchSubcategories,
  fetchTelegramLinks,
} from "@/lib/catalog-queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Каталог — EcoEnergy Marketplace" },
      { name: "description", content: "Каталог екотоварів від українських майстрів. Купуй напряму у виробника." },
      { property: "og:title", content: "Каталог EcoEnergy" },
      { property: "og:description", content: "Каталог екотоварів від українських майстрів." },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "EcoEnergy Marketplace",
          applicationCategory: "ShoppingApplication",
          operatingSystem: "Telegram",
          inLanguage: "uk",
        }),
      },
    ],
  }),
  component: CatalogPage,
});

const INITIAL: FilterState = {
  search: "",
  categoryId: null,
  subcategoryId: null,
  regionId: null,
  districtId: null,
  sort: "newest",
};

function CatalogPage() {
  const [filters, setFilters] = useState<FilterState>(INITIAL);
  const [view, setView] = useState<"sellers" | "products">("sellers");
  const [activeSellerWallet, setActiveSellerWallet] = useState<string | null>(null);

  const queryEnabled = filters.search.length === 0 || filters.search.length >= 3;

  const catalogQuery = useQuery({
    queryKey: ["catalog", filters],
    queryFn: () => fetchCatalog(filters),
    enabled: queryEnabled,
  });

  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const subcategoriesQuery = useQuery({
    queryKey: ["subcategories", filters.categoryId],
    queryFn: () => fetchSubcategories(filters.categoryId),
    enabled: !!filters.categoryId,
  });
  const regionsQuery = useQuery({ queryKey: ["regions"], queryFn: fetchRegions });
  const districtsQuery = useQuery({
    queryKey: ["districts", filters.regionId],
    queryFn: () => fetchDistricts(filters.regionId),
    enabled: !!filters.regionId,
  });

  const items = catalogQuery.data ?? [];

  const sellerWallets = useMemo(
    () => Array.from(new Set(items.map((i) => i.wallet_address).filter(Boolean))),
    [items],
  );
  const sellersQuery = useQuery({
    queryKey: ["telegram_links", sellerWallets.sort().join(",")],
    queryFn: () => fetchTelegramLinks(sellerWallets),
    enabled: sellerWallets.length > 0,
  });

  const regionsById = useMemo(() => {
    const m: Record<string, NonNullable<typeof regionsQuery.data>[number]> = {};
    for (const r of regionsQuery.data ?? []) m[r.id] = r;
    return m;
  }, [regionsQuery.data]);

  const districtsById = useMemo(() => {
    const m: Record<string, NonNullable<typeof districtsQuery.data>[number]> = {};
    for (const d of districtsQuery.data ?? []) m[d.id] = d;
    return m;
  }, [districtsQuery.data]);

  const loading = catalogQuery.isLoading || !queryEnabled;

  const grouped = useMemo(() => {
    const map = new Map<string, typeof items>();
    for (const it of items) {
      const arr = map.get(it.wallet_address) ?? [];
      arr.push(it);
      map.set(it.wallet_address, arr);
    }
    return Array.from(map.entries())
      .map(([wallet, list]) => ({
        wallet,
        items: [...list].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
      }))
      .sort((a, b) => b.items.length - a.items.length);
  }, [items]);

  const showSellersGrid = view === "sellers" && !activeSellerWallet;
  const productItems = activeSellerWallet
    ? items.filter((i) => i.wallet_address === activeSellerWallet)
    : items;
  const activeSeller = activeSellerWallet ? sellersQuery.data?.[activeSellerWallet] : undefined;
  const activeSellerTitle = activeSeller?.telegram_username
    ? `@${activeSeller.telegram_username}`
    : activeSellerWallet
      ? `Продавець ${activeSellerWallet.slice(0, 6)}…${activeSellerWallet.slice(-4)}`
      : "";

  return (
    <div className="space-y-5">
      <AdsBanner />

      <section aria-label="Каталог">
        <h1 className="sr-only">Каталог EcoEnergy</h1>
        <Filters
          value={filters}
          onChange={setFilters}
          categories={categoriesQuery.data ?? []}
          subcategories={subcategoriesQuery.data ?? []}
          regions={regionsQuery.data ?? []}
          districts={districtsQuery.data ?? []}
        />
      </section>

      {activeSellerWallet ? (
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-card/60 p-3">
          <div className="flex items-center gap-2 min-w-0">
            <Store className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate text-sm font-semibold">{activeSellerTitle}</span>
            <span className="shrink-0 text-xs text-muted-foreground">· {productItems.length}</span>
          </div>
          <div className="flex items-center gap-1">
            {activeSeller?.telegram_username && (
              <Button asChild variant="ghost" size="sm">
                <a
                  href={`https://t.me/${activeSeller.telegram_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setActiveSellerWallet(null)}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              До продавців
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-end gap-1 rounded-full border border-border bg-card/60 p-1 w-fit ml-auto">
          <button
            type="button"
            onClick={() => setView("sellers")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "sellers"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-pressed={view === "sellers"}
          >
            <Store className="h-3.5 w-3.5" />
            Продавці
          </button>
          <button
            type="button"
            onClick={() => setView("products")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "products"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-pressed={view === "products"}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Товари
          </button>
        </div>
      )}

      {catalogQuery.isError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Не вдалося завантажити каталог. Спробуйте оновити сторінку.
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[380px] w-full rounded-2xl" />
          ))}

        {!loading && productItems.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
            Нічого не знайдено за обраними фільтрами.
          </div>
        )}

        {!loading && showSellersGrid &&
          grouped.map((g) => (
            <SellerCard
              key={g.wallet}
              wallet={g.wallet}
              seller={sellersQuery.data?.[g.wallet]}
              items={g.items}
              onOpen={(w) => setActiveSellerWallet(w)}
            />
          ))}

        {!loading && !showSellersGrid &&
          productItems.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              seller={item.wallet_address ? sellersQuery.data?.[item.wallet_address] : undefined}
              region={item.region_id ? regionsById[item.region_id] : undefined}
              district={item.district_id ? districtsById[item.district_id] : undefined}
            />
          ))}
      </section>
    </div>
  );
}