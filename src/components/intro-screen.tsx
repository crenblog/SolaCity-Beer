import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { LoadScreen } from "@/components/load-screen";
import { SquigglyText } from "@/components/squiggly-text";
import { pack, dissolveToReel, useLedger, warmupLoadType, warmupPath, cacheVideo, pickVideo, prefetchPosters } from "@/lib/thin-path";
import { cn } from "@/lib/utils";

export function IntroScreen() {
  const navigate = useNavigate();
  const start = useLedger((s) => s.start);
  const [going, setGoing] = useState(false);
  const leaving = useRef(false);

  useEffect(() => {
    void warmupLoadType();
    const q1 = pack.questions[0];
    if (!q1) return;
    prefetchPosters(q1.options);
    const first = q1.options[0];
    const second = q1.options[1];
    if (first) void cacheVideo(pickVideo(first));
    if (second) void cacheVideo(pickVideo(second));
  }, []);

  function go() {
    if (leaving.current) return;
    leaving.current = true;
    flushSync(() => setGoing(true));
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        start();
        void warmupPath(pack.questions).then(() => {
          void dissolveToReel(() => navigate({ to: "/q/$step", params: { step: "1" } }));
        });
      });
    });
  }

  if (going) return <LoadScreen />;

  return (
    <div className="flex min-h-dvh flex-col px-screen">
      <div className="flex flex-1 flex-col items-center justify-center overflow-hidden">
        <h1 className="font-display text-center text-display font-medium leading-display tracking-display text-ink text-balance">
          {pack.intro.lines.map((line, i) => (
            <span
              key={`${line.text}-${i}`}
              className={cn("block stagger-in", line.emphasis && "italic")}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              {/drink/i.test(line.text) ? (
                <SquigglyText scale={line.emphasis ? 12 : 8} className="text-poster-name">
                  {line.text}
                </SquigglyText>
              ) : (
                line.text
              )}
            </span>
          ))}
        </h1>
      </div>
      <div className="relative z-50 flex flex-col items-center gap-3 pb-[max(7.5rem,calc(5.5rem+env(safe-area-inset-bottom)))]">
        <p className="font-sans text-meta tracking-wide text-ink-muted">ログイン不要 · 約90秒</p>
        <Button variant="pill" className="relative z-50 w-full touch-manipulation" onPointerDown={go}>
          {pack.intro.start}
        </Button>
        <p className="max-w-[16rem] text-center font-sans text-meta leading-relaxed tracking-wide text-ink-subtle">
          個人情報は収集しません。答えはこの端末だけに残ります。
        </p>
      </div>
    </div>
  );
}
