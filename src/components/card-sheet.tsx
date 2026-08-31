import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CARD_LABEL,
  CARD_TEMPLATES,
  renderCard,
  shareCard,
  type CardTemplate,
} from "@/lib/thin-path/card-kit";
import type { Item } from "@/lib/thin-path/types";
import { cn } from "@/lib/utils";

const PREVIEW_W = 540;

/** 그림 우물과 버튼은 겹치지 않는다. 사이 32px. */

export function CardSheet({ item, onClose }: { item: Item; onClose: () => void }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<CardTemplate>("picture");
  const [urls, setUrls] = useState<Partial<Record<CardTemplate, string>>>({});
  const [busy, setBusy] = useState(false);

  function layout() {
    const el = scroller.current;
    const card = el?.querySelector<HTMLElement>("[data-card]");
    if (!el || !card) return;
    const pad = Math.max(16, (el.clientWidth - card.offsetWidth) / 2);
    el.style.paddingInline = `${pad}px`;
  }

  function center(id: CardTemplate, behavior: ScrollBehavior = "smooth") {
    const el = scroller.current;
    const card = el?.querySelector<HTMLElement>(`[data-card="${id}"]`);
    if (!el || !card) return;
    layout();
    el.scrollTo({
      left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2,
      behavior,
    });
  }

  useEffect(() => {
    let alive = true;
    const made: string[] = [];
    void (async () => {
      for (const id of CARD_TEMPLATES) {
        const blob = await renderCard(item, id, PREVIEW_W);
        const url = URL.createObjectURL(blob);
        made.push(url);
        if (alive) setUrls((prev) => ({ ...prev, [id]: url }));
      }
    })();
    return () => {
      alive = false;
      made.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [item]);

  useLayoutEffect(() => {
    layout();
    if (urls.picture) center("picture", "instant");
  }, [urls.picture]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onResize = () => layout();
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [onClose]);

  const syncActive = () => {
    const el = scroller.current;
    if (!el) return;
    const cards = [...el.querySelectorAll<HTMLElement>("[data-card]")];
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = cards[0];
    let dist = Infinity;
    for (const card of cards) {
      const c = card.offsetLeft + card.offsetWidth / 2;
      const d = Math.abs(c - mid);
      if (d < dist) {
        dist = d;
        best = card;
      }
    }
    const id = best?.dataset.card as CardTemplate | undefined;
    if (id) setActive(id);
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-center bg-ink/70">
      <div className="flex h-full w-full max-w-stage flex-col bg-ink sheet-in">
        <header className="flex shrink-0 items-center justify-between px-screen pb-3 pt-screen">
          <p className="font-sans text-meta tracking-phase text-paper/55">カード</p>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 min-h-11 px-2 font-sans text-meta tracking-phase text-paper/70"
          >
            とじる
          </button>
        </header>

        <div
          ref={scroller}
          className="card-snap flex min-h-0 flex-1 items-center gap-5 overflow-x-auto py-8"
          onScroll={syncActive}
        >
          {CARD_TEMPLATES.map((id) => (
            <article
              key={id}
              data-card={id}
              className="aspect-poster h-full w-auto shrink-0 snap-center snap-always"
            >
              <div className="h-full w-full overflow-hidden rounded-[4px] bg-poster shadow-[0_12px_28px_rgba(0,0,0,0.28)]">
                {urls[id] ? (
                  <img
                    src={urls[id]}
                    alt={CARD_LABEL[id]}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="h-full w-full bg-poster" />
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="shrink-0 px-screen pt-8 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-center gap-2">
            {CARD_TEMPLATES.map((id) => (
              <button
                key={id}
                type="button"
                aria-label={CARD_LABEL[id]}
                onClick={() => center(id)}
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  id === active ? "bg-paper" : "bg-paper/30",
                )}
              />
            ))}
          </div>
          <p className="mt-3 text-center font-sans text-meta tracking-phase text-paper/55">
            {CARD_LABEL[active]}
          </p>
          <Button
            variant="frost"
            className="mt-6"
            disabled={busy || !urls[active]}
            onClick={() => {
              setBusy(true);
              void shareCard(item, active).finally(() => setBusy(false));
            }}
          >
            このカードを受け取る
          </Button>
        </div>
      </div>
    </div>
  );
}
