import { cn } from "@/lib/utils";
import type { Item } from "@/data/types";

/**
 * 병 PNG 규칙. 새 잔을 넣을 때 반드시.
 * - 누끼 PNG, 투명 배경. 뚜껑·바닥을 자르지 않는다.
 * - 캔버스 세로:가로 = 3:1. 병은 높이의 90%, 가로 가운데.
 * - 픽셀은 키우지 않는다. 작은 원본은 작은 3:1 캔버스에 둔다.
 * - 화면에서는 h-bottle / object-contain. 박스가 같으면 광학 높이도 같다.
 */
export function Bottle({ item, className }: { item: Item; className?: string }) {
  return (
    <img
      src={item.art ?? "/images/bottle.png?v=4"}
      alt={item.name}
      width={240}
      height={720}
      decoding="async"
      fetchPriority="high"
      className={cn("h-bottle w-auto origin-bottom object-contain", className)}
    />
  );
}
