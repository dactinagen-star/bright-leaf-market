import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CartLine } from "./types";

type CartCtx = {
  lines: CartLine[];
  add: (line: CartLine) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  count: number;
  total: number;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "ecoenergy_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines]);

  const add: CartCtx["add"] = (line) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.product_id === line.product_id);
      if (existing) {
        return prev.map((l) =>
          l.product_id === line.product_id ? { ...l, quantity: l.quantity + line.quantity } : l,
        );
      }
      return [...prev, line];
    });
  };

  const remove: CartCtx["remove"] = (id) =>
    setLines((prev) => prev.filter((l) => l.product_id !== id));

  const setQty: CartCtx["setQty"] = (id, qty) =>
    setLines((prev) =>
      prev
        .map((l) => (l.product_id === id ? { ...l, quantity: Math.max(1, qty) } : l))
        .filter((l) => l.quantity > 0),
    );

  const clear = () => setLines([]);

  const count = lines.reduce((s, l) => s + l.quantity, 0);
  const total = lines.reduce((s, l) => s + l.quantity * l.price_uah, 0);

  return (
    <Ctx.Provider value={{ lines, add, remove, setQty, clear, count, total }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}