import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Category, Subcategory, Region, District } from "@/lib/types";

export type FilterState = {
  search: string;
  categoryId: string | null;
  subcategoryId: string | null;
  regionId: string | null;
  districtId: string | null;
  sort: "newest" | "price_asc" | "price_desc";
};

const ALL = "__all__";

type Props = {
  value: FilterState;
  onChange: (next: FilterState) => void;
  categories: Category[];
  subcategories: Subcategory[];
  regions: Region[];
  districts: District[];
};

export function Filters({ value, onChange, categories, subcategories, regions, districts }: Props) {
  const hasFilters =
    value.search || value.categoryId || value.subcategoryId || value.regionId || value.districtId;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          placeholder="Пошук товарів…"
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Select
          value={value.categoryId ?? ALL}
          onValueChange={(v) =>
            onChange({
              ...value,
              categoryId: v === ALL ? null : v,
              subcategoryId: null,
            })
          }
        >
          <SelectTrigger><SelectValue placeholder="Категорія" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Усі категорії</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name_uk}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.subcategoryId ?? ALL}
          disabled={!value.categoryId}
          onValueChange={(v) => onChange({ ...value, subcategoryId: v === ALL ? null : v })}
        >
          <SelectTrigger><SelectValue placeholder="Підкатегорія" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Усі</SelectItem>
            {subcategories.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name_uk}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.regionId ?? ALL}
          onValueChange={(v) =>
            onChange({
              ...value,
              regionId: v === ALL ? null : v,
              districtId: null,
            })
          }
        >
          <SelectTrigger><SelectValue placeholder="Область" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Уся Україна</SelectItem>
            {regions.map((r) => (
              <SelectItem key={r.id} value={r.id}>{r.name_uk}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.districtId ?? ALL}
          disabled={!value.regionId}
          onValueChange={(v) => onChange({ ...value, districtId: v === ALL ? null : v })}
        >
          <SelectTrigger><SelectValue placeholder="Район" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Усі райони</SelectItem>
            {districts.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name_uk}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Select value={value.sort} onValueChange={(v) => onChange({ ...value, sort: v as FilterState["sort"] })}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Нові спочатку</SelectItem>
            <SelectItem value="price_asc">Ціна: ↑</SelectItem>
            <SelectItem value="price_desc">Ціна: ↓</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onChange({
                search: "",
                categoryId: null,
                subcategoryId: null,
                regionId: null,
                districtId: null,
                sort: "newest",
              })
            }
          >
            <X className="mr-1 h-4 w-4" />Скинути
          </Button>
        )}
      </div>
    </div>
  );
}