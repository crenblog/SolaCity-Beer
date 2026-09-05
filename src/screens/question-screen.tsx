import { useEffect, useState } from "react";
import { Button } from "@/screens/ui/button";
import { OptionReel } from "@/screens/option-reel";
import { applyInkChrome } from "@/app/chrome";
import type { Question } from "@/data/types";
import { cn } from "@/lib/utils";

/** 두 줄 일본어를 읽히는 시간. 탭하면 바로 영상. */
const ASK_MS = 2800;

export function QuestionScreen({
  question,
  phases,
  index,
  selected,
  onSelect,
  onConfirm,
}: {
  question: Question;
  phases: string[];
  index: number;
  selected: string | null;
  onSelect: (id: string) => void;
  onConfirm: () => void;
}) {
  const headingId = `q-${question.id}`;
  const current = question.options.find((o) => o.id === selected);
  const [asking, setAsking] = useState(() => {
    if (typeof window === "undefined") return true;
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (asking) applyInkChrome();
  }, [asking]);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ms = reduce ? 0 : ASK_MS;
    const t = window.setTimeout(() => setAsking(false), ms);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <form
      className="relative h-full min-h-0 vt-stage"
      onSubmit={(e) => {
        e.preventDefault();
        if (asking || !selected) return;
        onConfirm();
      }}
    >
      <OptionReel
        options={question.options}
        selected={selected}
        onSelect={onSelect}
        labelledBy={headingId}
        live={!asking}
      />

      {/* 상단 세이프존. 흰 글자 + 스크림 + 그림자. 영상 밝아도 읽힘. */}
      <header
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 z-20 scrim-top px-screen pt-screen pb-16 transition-opacity duration-[480ms] ease-[cubic-bezier(0.45,0.05,0.55,0.95)]",
          asking ? "opacity-0" : "opacity-100",
        )}
      >
        <nav aria-label="今夜の流れ" className="flex items-center gap-6">
          {phases.map((phase, i) => (
            <span
              key={phase}
              className={cn(
                "reel-title font-sans text-[0.625rem] tracking-[0.2em]",
                i === index ? "opacity-100" : "opacity-40",
              )}
            >
              {phase}
            </span>
          ))}
        </nav>
        <h1
          id={headingId}
          className="reel-title mt-4 max-w-[16rem] font-sans text-[1.25rem] font-medium leading-[1.35] tracking-tight text-pretty whitespace-pre-line"
        >
          {question.prompt}
        </h1>
      </header>

      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 z-20 scrim-bottom px-screen pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-20 transition-opacity duration-[480ms] ease-[cubic-bezier(0.45,0.05,0.55,0.95)]",
          asking ? "opacity-0" : "opacity-100",
        )}
      >
        <p className="reel-title mb-3 font-sans text-[0.9375rem] tracking-wide">{current?.label ?? ""}</p>
        <Button type="submit" variant="frost" className="pointer-events-auto min-h-14" disabled={!selected || asking}>
          {question.confirm}
        </Button>
      </div>

      <div
        className={cn(
          "absolute inset-0 z-30 flex cursor-pointer flex-col bg-ink transition-opacity duration-[480ms] ease-[cubic-bezier(0.45,0.05,0.55,0.95)]",
          asking ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setAsking(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setAsking(false);
          }
        }}
        role="button"
        tabIndex={asking ? 0 : -1}
      >
        {/* 광학 중심. 기하 중앙보다 조금 위. 제목은 여기서만. */}
        <div className="absolute inset-x-0 top-[42%] -translate-y-1/2 px-screen text-center">
          <p className="font-sans text-[0.625rem] tracking-[0.2em] text-paper/45">{phases[index]}</p>
          <p className="mt-5 font-sans text-question font-medium leading-snug tracking-tight text-paper text-pretty whitespace-pre-line">
            {question.prompt}
          </p>
        </div>
        <p className="mt-auto pb-[max(2rem,env(safe-area-inset-bottom))] text-center font-sans text-meta tracking-phase text-paper/35">
          タッチ
        </p>
      </div>
    </form>
  );
}
