import { Link, useRouterState } from "@tanstack/react-router";
import { Leaf, ShoppingBasket } from "lucide-react";
import { useCart } from "@/lib/cart-store";

export function AppHeader() {
  const { count } = useCart();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Leaf className="h-4 w-4" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold text-foreground">EcoEnergy</span>
            <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">
              marketplace
            </span>
          </span>
        </Link>
        <Link
          to="/cart"
          className="relative inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent"
          aria-current={pathname === "/cart" ? "page" : undefined}
        >
          <ShoppingBasket className="h-4 w-4" />
          Кошик
          {count > 0 && (
            <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}