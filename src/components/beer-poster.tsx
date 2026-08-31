import { Bottle } from "@/components/bottle";
import type { Item } from "@/lib/thin-path/types";

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
