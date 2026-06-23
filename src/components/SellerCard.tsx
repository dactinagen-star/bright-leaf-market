import { Store, MessageCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CatalogItem, TelegramLink } from "@/lib/types";

type Props = {
  wallet: string;
  seller?: TelegramLink;
  items: CatalogItem[];
  onOpen: (wallet: string) => void;
};

const PREVIEW_LIMIT = 8;

export function SellerCard({ wallet, seller, items, onOpen }: Props) {
  const title =
    seller?.telegram_username
      ? `@${seller.telegram_username}`
      : `Продавець ${wallet.slice(0, 6)}…${wallet.slice(-4)}`;

  const preview = items.slice(0, PREVIEW_LIMIT);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <button
        type="button"
        onClick={() => onOpen(wallet)}
        className="flex items-center justify-between gap-2 border-b border-border/60 bg-secondary/30 p-4 text-left hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Store className="h-4 w-4 shrink-0 text-primary" />
          <h3 className="truncate text-base font-semibold">{title}</h3>
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {items.length}
        </span>
      </button>

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
        <Button type="button" onClick={() => onOpen(wallet)} className="w-full">
          Відвідати ({items.length})
          <ChevronRight className="ml-1 h-4 w-4" />
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