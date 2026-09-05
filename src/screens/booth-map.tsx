import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const SIZE = 5;

function Cell({
  here,
  shop,
  span,
  cellRef,
  children,
}: {
  here?: boolean;
  shop?: boolean;
  span?: number;
  cellRef?: (node: HTMLDivElement | null) => void;
  children?: ReactNode;
}) {
  return (
    <div
      ref={cellRef}
      className={cn(
        "flex h-11 items-center justify-center font-sans text-meta tracking-wide",
        span === 2 && "col-span-2",
        (here || shop) && "relative z-10",
        shop && "bg-ink text-paper",
        here && "border border-ink-subtle bg-paper text-ink-muted",
        !here && !shop && "bg-surface text-ink-muted",
      )}
      aria-current={shop ? "true" : here ? "location" : undefined}
    >
      {children}
    </div>
  );
}

export function BoothMap({ booth: _booth }: { booth: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const hereRef = useRef<HTMLDivElement>(null);
  const shopRef = useRef<HTMLDivElement>(null);
  const [line, setLine] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    w: number;
    h: number;
  } | null>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const here = hereRef.current;
    const shop = shopRef.current;
    if (!wrap || !here || !shop) return;

    const measure = () => {
      const wr = wrap.getBoundingClientRect();
      const ar = here.getBoundingClientRect();
      const br = shop.getBoundingClientRect();
      setLine({
        w: wr.width,
        h: wr.height,
        x1: ar.left - wr.left + ar.width / 2,
        y1: ar.top - wr.top + ar.height / 2,
        x2: br.left - wr.left + br.width / 2,
        y2: br.top - wr.top + br.height / 2,
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  const tiles: { key: string; here?: boolean; shop?: boolean; span?: number }[] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (r === SIZE - 1 && c === SIZE - 1) continue;
      tiles.push({
        key: `${r}-${c}`,
        here: r === 0 && c === 0,
        shop: r === SIZE - 1 && c === SIZE - 2,
        span: r === SIZE - 1 && c === SIZE - 2 ? 2 : 1,
      });
    }
  }

  return (
    <div>
      <p className="font-sans text-meta tracking-phase text-ink-muted">購入できる場所</p>
      <p className="mt-2 font-display text-question font-medium tracking-tight text-ink">販売所</p>
      <div ref={wrapRef} className="relative mt-5" role="img" aria-label="現在地から販売所へ、最短">
        <div className="grid grid-cols-5 gap-2">
          {tiles.map((tile) => (
            <Cell
              key={tile.key}
              here={tile.here}
              shop={tile.shop}
              span={tile.span}
              cellRef={
                tile.here ? (n) => { hereRef.current = n; } : tile.shop ? (n) => { shopRef.current = n; } : undefined
              }
            >
              {tile.shop ? "販売所" : tile.here ? "現在地" : null}
            </Cell>
          ))}
        </div>
        {line ? (
          <svg
            className="pointer-events-none absolute left-0 top-0 z-[1] text-ink/30"
            width={line.w}
            height={line.h}
            aria-hidden="true"
          >
            <line
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
        ) : null}
      </div>
      <p className="mt-4 font-sans text-meta tracking-wide text-ink-muted">現在地 → 販売所</p>
    </div>
  );
}
