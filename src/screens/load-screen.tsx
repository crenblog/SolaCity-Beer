import { RollingText } from "@/screens/v1/skiper27";

const START_LINES = ["グラスを置く。", "泡が立つ。", "今夜、はじまる。"];

export function LoadScreen() {
  return (
    <div className="vt-stage flex min-h-dvh flex-col px-screen">
      <div className="flex flex-1 flex-col items-center justify-center overflow-hidden px-1">
        <p className="font-display text-display font-medium leading-display tracking-display text-ink">
          <RollingText texts={START_LINES} speed={0.05} duration={2} />
        </p>
      </div>
      <div className="relative z-30 flex flex-col items-center gap-3 pb-[max(7.5rem,calc(5.5rem+env(safe-area-inset-bottom)))]">
        <p className="font-sans text-meta tracking-wide text-ink-muted">今夜の一杯</p>
      </div>
    </div>
  );
}
