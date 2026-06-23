import { useState } from "react";
import { Store, MessageCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import type { CatalogItem, TelegramLink, Region, District } from "@/lib/types";

type Props = {
  wallet: string;
  seller?: TelegramLink;
  items: CatalogItem[];
  regionsById: Record<string, Region>;
  districtsById: Record<string, District>;
};

const PREVIEW_LIMIT = 8;

export function SellerCard({ wallet, seller, items, regionsById, districtsById }: Props) {
  const [open, setOpen] = useState(false);

  const title =
    seller?.telegram_username
      ? `@${seller.telegram_username}`
      : `Продавець ${wallet.slice(0, 6)}…${wallet.slice(-4)}`;

  const preview = items.slice(0, PREVIEW_LIMIT);

  if (open) {
    return (
      <section className="space-y-3 sm:col-span-2">
        <header className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 min-w-0">
            <Store className="h-4 w-4 shrink-0 text-primary" />
            <h2 className="truncate text-base font-semibold">{title}</h2>
            <span className="shrink-0 text-xs text-muted-foreground">· {items.length} поз.</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Згорнути
          </Button>
        </header>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              seller={seller}
              region={item.region_id ? regionsById[item.region_id] : undefined}
              district={item.district_id ? districtsById[item.district_id] : undefined}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <header className="flex items-center justify-between gap-2 border-b border-border/60 bg-secondary/30 p-4">
        <div className="flex items-center gap-2 min-w-0">
          <Store className="h-4 w-4 shrink-0 text-primary" />
          <h3 className="truncate text-base font-semibold">{title}</h3>
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {items.length}
        </span>
      </header>

      <ol className="flex-1 space-y-1.5 p-4 text-sm">
        {preview.map((item, i) => (
          <li key={item.id} className="flex items-baseline gap-2">
            <span className="w-5 shrink-0 text-right text-xs text-muted-foreground">{i + 1}.</span>
            <span className="flex-1 truncate text-foreground">{item.name}</span>
            {item.price_uah != null && (
              <span className="shrink-0 text-xs font-medium text-primary">
                {item.price_uah.toLocaleString("uk-UA")} ₴
              </span>
            )}
          </li>
        ))}
        {items.length > preview.length && (
          <li className="pl-7 text-xs text-muted-foreground">
            …і ще {items.length - preview.length}
          </li>
        )}
      </ol>

      <div className="flex flex-col gap-2 p-4 pt-0">
        <Button type="button" onClick={() => setOpen(true)} className="w-full">
          <ChevronDown className="mr-1 h-4 w-4" />
          Відвідати ({items.length})
        </Button>
        {seller?.telegram_username && (
          <Button asChild variant="outline" className="w-full">
            <a
              href={`https://t.me/${seller.telegram_username}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="mr-1 h-4 w-4" />
              Написати продавцю
            </a>
          </Button>
        )}
      </div>
    </article>
  );
}