import { RollingText } from "@/screens/v1/skiper27";

/**
 * 페스티벌에서 잔을 기다리는 감정. 글자만 바뀌고 4초마다 흩어져 맞춰진다.
 * 今夜の一杯은 스타트와 같은 자리. 가운데는 시만.
 */
const LINES = [
  "一口目の前が、\nいちばんうまい。",
  "どのブースへ\n行こう。",
  "泡の立つ音が、\n聞こえる。",
  "乾杯まで、\nあと少し。",
  "今夜の味が、\n集まっている。",
  "次の一杯が、\nもう近い。",
];

export function CurateScreen({ onSkip }: { onSkip: () => void }) {
  return (
    <button
      type="button"
      onClick={onSkip}
      className="flex min-h-dvh w-full flex-col px-screen text-center"
      aria-label="結果を見る"
    >
      <div className="flex flex-1 flex-col items-center justify-center overflow-hidden px-1">
        <p className="w-full font-display text-[clamp(1.75rem,6.2vw,2.375rem)] font-medium leading-[1.25] tracking-display text-ink">
          <RollingText texts={LINES} speed={0.05} duration={4} />
        </p>
      </div>
      <div className="relative z-30 flex flex-col items-center gap-3 pb-[max(7.5rem,calc(5.5rem+env(safe-area-inset-bottom)))]">
        <p className="font-sans text-meta tracking-wide text-ink-muted">今夜の一杯</p>
      </div>
    </button>
  );
}
