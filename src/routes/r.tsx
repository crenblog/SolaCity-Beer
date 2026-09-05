import { useEffect, useRef, useState } from "react";
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { CurateScreen } from "@/result/curate-screen";
import { ResultScreen } from "@/result/result-screen";
import { Stage } from "@/shared/stage";
import { compare, isComplete, pack, useLedger, warmupHero } from "@/shared";

export const Route = createFileRoute("/r")({ component: ResultPage });

function ResultPage() {
  const navigate = useNavigate();
  const hydrate = useLedger((s) => s.hydrate);
  const hydrated = useLedger((s) => s.hydrated);
  const answers = useLedger((s) => s.answers);
  const reset = useLedger((s) => s.reset);
  const born = useRef(0);
  const [ready, setReady] = useState(false);
  const [hero, setHero] = useState(false);

  useEffect(() => {
    hydrate();
    void warmupHero().then(() => setHero(true));
  }, [hydrate]);

  const result = hydrated && isComplete(pack, answers) ? compare(pack, answers) : null;

  useEffect(() => {
    if (!result) return;
    if (!born.current) born.current = Date.now();
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setReady(true);
      return;
    }
    const wait = Math.max(0, 10000 - (Date.now() - born.current));
    const t = window.setTimeout(() => setReady(true), wait);
    return () => window.clearTimeout(t);
  }, [result]);

  if (hydrated && !result) {
    return <Navigate to="/" />;
  }

  return (
    <Stage tone="result">
      {result && ready && hero ? (
        <ResultScreen
          result={result}
          answers={answers}
          narration={null}
          onAgain={() => {
            reset();
            void navigate({ to: "/" });
          }}
        />
      ) : result ? (
        <CurateScreen onSkip={() => setReady(true)} />
      ) : (
        <div className="min-h-dvh bg-result" />
      )}
    </Stage>
  );
}
