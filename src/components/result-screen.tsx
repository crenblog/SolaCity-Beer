import { useEffect, useState } from "react";
import { BeerThumb } from "@/components/beer-poster";
import { Bottle } from "@/components/bottle";
import { BoothMap } from "@/components/booth-map";
import { CardSheet } from "@/components/card-sheet";
import { useFoldChroma } from "@/components/fold-chroma";
import { Button } from "@/components/ui/button";
import { pack } from "@/lib/thin-path";
import { wrapJa } from "@/lib/thin-path/wrap-ja";
import type { AnswerMap, CompareResult } from "@/lib/thin-path/types";

export function ResultScreen({
  result,
  answers,
  narration,
  onAgain,
}: {
  result: CompareResult;
  answers: AnswerMap;
  narration: string | null;
  onAgain: () => void;
}) {
  const { item } = result.winner;
  const toast = narration ?? item.line;
  const picks = pack.questions.map((q) => {
    const option = q.options.find((o) => o.id === answers[q.id]);
    return { phase: q.phase, label: option?.label ?? "" };
  });
  // 2위·3위만. 장은 다시 안 키운다. 부스에서 알아보는 작은 병.
  const others = result.ranked.filter((row) => row.item.id !== item.id).slice(0, 2);
  const [sheet, setSheet] = useState(false);
  const fold = useFoldChroma<HTMLElement>();

  return (
    <div>
      {/* 오늘 잔. 이 화면이 추천. 같은 병을 포스터로 한 번 더 그리지 않는다. */}
      <section
        ref={fold}
        className="dawn flex min-h-[calc(100svh-2.25rem)] flex-col px-screen"
      >
        <header className="shrink-0 pt-screen flex items-baseline justify-between font-sans text-meta tracking-[0.18em] text-ink-muted">
          <span>{item.style}</span>
          <span className="tabular-nums">{item.abv}</span>
        </header>

        <div className="relative flex flex-1 flex-col items-center justify-center -translate-y-4">
          <h1 className="chroma-type relative z-0 max-w-full px-1 text-center font-display text-product font-medium leading-[0.88] tracking-display text-poster-name text-balance">
            {item.name}
          </h1>
          <div className="chroma-img relative z-10 -mt-3 flex justify-center">
            <Bottle item={item} className="h-bottle w-auto" />
          </div>
          <SoftLine
            text={toast}
            className="mt-8 text-center font-sans text-sm leading-relaxed text-ink-muted text-pretty"
          />
          <p className="mt-8 text-center font-sans text-meta tracking-[0.22em] text-ink-muted">
            {item.place}
          </p>
        </div>
      </section>

      <div className="h-px bg-ink-subtle mx-7" />

      <section className="px-screen pt-10">
        <p className="font-sans text-meta tracking-phase text-ink-muted">今夜の選び</p>
        <ul className="mt-5 flex flex-col gap-4">
          {picks.map((pick) => (
            <li key={pick.phase} className="flex items-baseline justify-between gap-6">
              <span className="font-sans text-meta tracking-phase text-ink-muted">{pick.phase}</span>
              <span className="font-sans text-option tracking-wide text-ink">{pick.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-screen pt-10">
        <BoothMap booth={item.booth} />
      </section>

      {others.length > 0 ? (
        <section className="px-screen pt-12">
          <p className="font-sans text-meta tracking-phase text-ink-muted">つぎの一杯</p>
          <ul className="mt-6 flex flex-col">
            {others.map((row) => (
              <li
                key={row.item.id}
                className="flex items-center gap-4 border-t border-ink-subtle py-4"
              >
                <BeerThumb item={row.item} />
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-option tracking-wide text-ink">{row.item.name}</p>
                  <p className="mt-1 font-sans text-sm leading-relaxed text-ink-muted">
                    {wrapJa(row.item.line).map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="px-screen pt-12 pb-[max(6.5rem,calc(4rem+env(safe-area-inset-bottom)))]">
        {/* 카드는 출구. 부스·다른 잔을 본 다음. 한 잔 산 사람의 증표. */}
        <p className="text-center font-sans text-sm leading-relaxed tracking-wide text-ink">
          {wrapJa("ブースで一杯お買い上げの方に、この絵のカードを。").map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
        <Button variant="ink" className="mt-5" onClick={() => setSheet(true)}>
          カードを受け取る
        </Button>
        <div className="mt-8 flex justify-center">
          <Button variant="ghost" onClick={onAgain}>
            もう一度
          </Button>
        </div>
      </section>
      {sheet ? <CardSheet item={{ ...item, line: toast }} onClose={() => setSheet(false)} /> : null}
    </div>
  );
}

function SoftLine({ text, className }: { text: string; className?: string }) {
  const [shown, setShown] = useState(text);
  const [dim, setDim] = useState(false);

  useEffect(() => {
    if (text === shown) return;
    setDim(true);
    const t = window.setTimeout(() => {
      setShown(text);
      setDim(false);
    }, 320);
    return () => window.clearTimeout(t);
  }, [text, shown]);

  return (
    <p className={`${className} transition-opacity duration-500 ease-[cubic-bezier(0.45,0.05,0.55,0.95)] ${dim ? "opacity-0" : "opacity-100"}`}>
      {wrapJa(shown).map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </p>
  );
}
