import { Bottle } from "@/beers/bottle";
import type { Item } from "@/shared/types";

export function BeerThumb({ item }: { item: Item }) {
  return (
    <div
      className="flex h-thumb w-thumb shrink-0 items-end justify-center border border-ink-subtle bg-poster pb-2"
      aria-hidden="true"
    >
      <Bottle item={item} className="h-thumb-bottle w-auto" />
    </div>
  );
}
