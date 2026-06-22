import { Megaphone } from "lucide-react";

/**
 * TODO: Підключити смартконтракт ECO_ADS (Polygon Mainnet)
 * Адреса: 0xd1e7F07A7760aeb05285E8Fceb6e0033D12C5F6B
 * Функція: getActiveAds() → Ad[]
 * Бібліотека: viem з https://polygon-rpc.com
 * Поки що — заглушка з рекламним місцем.
 */
export function AdsBanner() {
  return (
    <div className="rounded-2xl border border-secondary bg-secondary/40 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <Megaphone className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Рекламне місце
          </p>
          <p className="truncate text-sm text-foreground">
            Тут з'являться активні оголошення ECO_ADS
          </p>
        </div>
      </div>
    </div>
  );
}