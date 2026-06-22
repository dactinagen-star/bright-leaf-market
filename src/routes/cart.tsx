import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/lib/cart-store";
import { getTelegramUser } from "@/lib/telegram";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Кошик — EcoEnergy Marketplace" },
      { name: "description", content: "Оформлення індивідуального замовлення." },
    ],
  }),
  component: CartPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Вкажіть ПІБ").max(100),
  phone: z
    .string()
    .trim()
    .min(10, "Вкажіть телефон")
    .max(20)
    .regex(/^[+\d\s\-()]+$/, "Некоректний формат"),
  delivery_method: z.enum(["nova_poshta", "ukr_poshta", "self_pickup"]),
  address: z.string().trim().min(3, "Вкажіть адресу").max(300),
  comment: z.string().trim().max(500).optional().or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

function CartPage() {
  const { lines, setQty, remove, clear, total, count } = useCart();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      delivery_method: "nova_poshta",
      address: "",
      comment: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const tgUser = getTelegramUser();
      // Групуємо позиції за продавцем — по одному замовленню на продавця
      const bySeller = new Map<string, typeof lines>();
      for (const l of lines) {
        const key = l.seller_wallet;
        if (!bySeller.has(key)) bySeller.set(key, []);
        bySeller.get(key)!.push(l);
      }

      for (const [, sellerLines] of bySeller) {
        const payload = {
          buyer: {
            telegram_id: tgUser?.id ?? null,
            telegram_username: tgUser?.username ?? null,
            name: values.name,
            phone: values.phone,
          },
          items: sellerLines.map((l) => ({
            product_id: l.product_id,
            product_name: l.product_name,
            seller_telegram_id: l.seller_telegram_id,
            quantity: l.quantity,
            price_uah: l.price_uah,
            total_uah: l.quantity * l.price_uah,
          })),
          delivery: { method: values.delivery_method, address: values.address },
          comment: values.comment || undefined,
          total_uah: sellerLines.reduce((s, l) => s + l.quantity * l.price_uah, 0),
        };
        // TODO: підключити продакшн-ендпоінт коли буде наданий
        // await fetch("/api/send-order", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload) });
        console.info("[ecoenergy] order payload", payload);
      }

      toast.success("✅ Замовлення надіслано", {
        description: `Продавці отримають ваше замовлення в Telegram (${bySeller.size}).`,
      });
      clear();
      form.reset();
    } catch (e) {
      console.error(e);
      toast.error("Не вдалося надіслати замовлення");
    } finally {
      setSubmitting(false);
    }
  }

  if (count === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
        <ShoppingBag className="mb-3 h-10 w-10 text-muted-foreground" />
        <h1 className="text-lg font-semibold text-foreground">Кошик порожній</h1>
        <p className="mt-1 text-sm text-muted-foreground">Додайте товари з каталогу</p>
        <Button asChild className="mt-5">
          <Link to="/"><ArrowLeft className="mr-1 h-4 w-4" />До каталогу</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Оформлення замовлення</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {count} {count === 1 ? "позиція" : "позицій"} на суму {total.toLocaleString("uk-UA")} ₴
        </p>
      </div>

      <section className="space-y-3">
        {lines.map((l) => (
          <article
            key={l.product_id}
            className="flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm"
          >
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary/40">
              {l.image_url && (
                <img src={l.image_url} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <h3 className="line-clamp-2 text-sm font-semibold text-foreground">{l.product_name}</h3>
              <p className="mt-0.5 text-sm font-bold text-primary">
                {l.price_uah.toLocaleString("uk-UA")} ₴
              </p>
              <div className="mt-auto flex items-center justify-between">
                <div className="inline-flex items-center rounded-full border border-border">
                  <button
                    type="button"
                    onClick={() => setQty(l.product_id, l.quantity - 1)}
                    className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
                    aria-label="Зменшити"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-6 text-center text-sm font-semibold">{l.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQty(l.product_id, l.quantity + 1)}
                    className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
                    aria-label="Збільшити"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(l.product_id)}
                  className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                >
                  <Trash2 className="h-3.5 w-3.5" />Видалити
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h2 className="text-base font-semibold text-foreground">Контактні дані</h2>

        <div className="space-y-1.5">
          <Label htmlFor="name">ПІБ отримувача</Label>
          <Input id="name" {...form.register("name")} placeholder="Іван Іваненко" />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Телефон</Label>
          <Input id="phone" type="tel" {...form.register("phone")} placeholder="+380501234567" />
          {form.formState.errors.phone && (
            <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Спосіб доставки</Label>
          <RadioGroup
            value={form.watch("delivery_method")}
            onValueChange={(v) => form.setValue("delivery_method", v as FormValues["delivery_method"])}
            className="grid grid-cols-1 gap-2"
          >
            {[
              { v: "nova_poshta", label: "Нова Пошта" },
              { v: "ukr_poshta", label: "Укрпошта" },
              { v: "self_pickup", label: "Самовивіз" },
            ].map((o) => (
              <label
                key={o.v}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              >
                <RadioGroupItem value={o.v} id={o.v} />
                {o.label}
              </label>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address">Адреса / номер відділення</Label>
          <Input id="address" {...form.register("address")} placeholder="м. Дніпро, відд. №5" />
          {form.formState.errors.address && (
            <p className="text-xs text-destructive">{form.formState.errors.address.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="comment">Коментар (необов'язково)</Label>
          <Textarea id="comment" rows={3} {...form.register("comment")} placeholder="Без коробки, дзвонити перед доставкою…" />
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">До сплати</p>
            <p className="text-2xl font-bold text-primary">{total.toLocaleString("uk-UA")} ₴</p>
          </div>
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? "Надсилання…" : "Підтвердити замовлення"}
          </Button>
        </div>
      </form>
    </div>
  );
}