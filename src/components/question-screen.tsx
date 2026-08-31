import { Button } from "@/components/ui/button";
import { OptionReel } from "@/components/option-reel";
import type { Question } from "@/lib/thin-path/types";
import { cn } from "@/lib/utils";

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

  return (
    <form
      className="relative h-full min-h-0 vt-stage"
      onSubmit={(e) => {
        e.preventDefault();
        if (selected) onConfirm();
      }}
    >
      <OptionReel
        options={question.options}
        selected={selected}
        onSelect={onSelect}
        labelledBy={headingId}
      />

      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 scrim-top px-screen pt-screen pb-16">
        <nav aria-label="今夜の流れ" className="flex items-center gap-6">
          {phases.map((phase, i) => (
            <span
              key={phase}
              className={cn(
                "font-sans text-[0.625rem] tracking-[0.2em]",
                i === index ? "text-paper" : "text-paper/40",
              )}
            >
              {phase}
            </span>
          ))}
        </nav>
        <h1
          id={headingId}
          className="mt-4 max-w-[16rem] font-sans text-[1.25rem] font-medium leading-[1.35] tracking-tight text-paper text-pretty whitespace-pre-line"
        >
          {question.prompt}
        </h1>
      </header>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 scrim-bottom px-screen pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-20">
        <p className="mb-3 font-sans text-[0.9375rem] tracking-wide text-paper">{current?.label ?? ""}</p>
        <Button type="submit" variant="frost" className="pointer-events-auto min-h-14" disabled={!selected}>
          {question.confirm}
        </Button>
      </div>
    </form>
  );
}
