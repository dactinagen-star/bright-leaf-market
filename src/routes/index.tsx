import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdsBanner } from "@/components/AdsBanner";
import { Filters, type FilterState } from "@/components/Filters";
import { ProductCard } from "@/components/ProductCard";
import { SellerCard } from "@/components/SellerCard";
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
  sort: "by_seller",
};

function CatalogPage() {
  const [filters, setFilters] = useState<FilterState>(INITIAL);

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
    if (filters.sort !== "by_seller") return null;
    const map = new Map<string, typeof items>();
    for (const it of items) {
      const arr = map.get(it.wallet_address) ?? [];
      arr.push(it);
      map.set(it.wallet_address, arr);
    }
    return Array.from(map.entries()).map(([wallet, list]) => ({
      wallet,
      items: [...list].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    }));
  }, [items, filters.sort]);

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

        {!loading && items.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
            Нічого не знайдено за обраними фільтрами.
          </div>
        )}

        {!loading && grouped &&
          grouped.map((g) => (
            <SellerCard
              key={g.wallet}
              wallet={g.wallet}
              seller={sellersQuery.data?.[g.wallet]}
              items={g.items}
              regionsById={regionsById}
              districtsById={districtsById}
            />
          ))}

        {!loading && !grouped &&
          items.map((item) => (
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