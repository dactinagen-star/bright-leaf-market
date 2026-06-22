import { useState } from "react";
import { MapPin, MessageCircle, Plus, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import type { CatalogItem, TelegramLink, Region, District } from "@/lib/types";

type Props = {
  item: CatalogItem;
  seller?: TelegramLink;
  region?: Region;
  district?: District;
};

export function ProductCard({ item, seller, region, district }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { add } = useCart();

  const price = item.price_uah ?? 0;
  const location = [district?.name_uk, region?.name_uk].filter(Boolean).join(", ");

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary/30">
        {item.image_url && !imgError ? (
          <img
            src={item.image_url}
            alt={item.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-10 w-10 opacity-50" />
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="text-base font-semibold leading-tight text-foreground">{item.name}</h3>
          {location && (
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {location}
            </p>
          )}
        </div>

        {item.description && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="block w-full text-left text-sm text-muted-foreground"
          >
            <span className={expanded ? "" : "line-clamp-2"}>{item.description}</span>
            {item.description.length > 80 && (
              <span className="mt-1 inline-block text-xs font-medium text-primary">
                {expanded ? "Згорнути" : "Детальніше"}
              </span>
            )}
          </button>
        )}

        <div className="flex items-baseline justify-between pt-1">
          <span className="text-xl font-bold text-primary">{price.toLocaleString("uk-UA")} ₴</span>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <Button
            type="button"
            onClick={() =>
              add({
                product_id: item.id,
                product_name: item.name,
                seller_wallet: item.wallet_address,
                seller_telegram_id: seller?.telegram_id ?? null,
                seller_telegram_username: seller?.telegram_username ?? null,
                price_uah: price,
                image_url: item.image_url,
                quantity: 1,
              })
            }
            className="w-full"
          >
            <Plus className="mr-1 h-4 w-4" />
            Додати в замовлення
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
      </div>
    </article>
  );
}