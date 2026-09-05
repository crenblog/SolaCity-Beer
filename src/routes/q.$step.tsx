import { useEffect } from "react";
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { QuestionScreen } from "@/questions/question-screen";
import { Stage } from "@/shared/stage";
import { pack, prefetchNeighbors, prefetchPosters, useLedger, warmupHero } from "@/shared";
import { withStepTransition } from "@/shared/step-transition";

export const Route = createFileRoute("/q/$step")({ component: QuestionPage });

function QuestionPage() {
  const navigate = useNavigate();
  const { step: stepParam } = Route.useParams();
  const step = Number.parseInt(stepParam, 10);
  const hydrate = useLedger((s) => s.hydrate);
  const hydrated = useLedger((s) => s.hydrated);
  const id = useLedger((s) => s.id);
  const answers = useLedger((s) => s.answers);
  const choose = useLedger((s) => s.choose);

  const start = useLedger((s) => s.start);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && !id) start();
  }, [hydrated, id, start]);

  useEffect(() => {
    if (!id) return;
    const q = pack.questions[step - 1];
    const first = q?.options[0];
    if (q && !answers[q.id] && first) choose(q.id, first.id);
  }, [answers, choose, id, step]);

  useEffect(() => {
    const q = pack.questions[step - 1];
    if (!q) return;
    const selected = answers[q.id] ?? q.options[0]?.id ?? null;
    prefetchNeighbors(q.options, selected);
    const next = pack.questions[step];
    if (!next) return;
    prefetchPosters(next.options);
    const later = window.setTimeout(() => {
      prefetchNeighbors(next.options, next.options[0]?.id ?? null);
    }, 1500);
    return () => window.clearTimeout(later);
  }, [answers, step]);

  if (!Number.isFinite(step) || step < 1) {
    return <Navigate to="/q/$step" params={{ step: "1" }} />;
  }

  if (step > pack.questions.length) {
    return <Navigate to="/r" />;
  }

  const question = pack.questions[step - 1];
  if (!question) {
    return <Navigate to="/" />;
  }

  const selected = answers[question.id] ?? question.options[0]?.id ?? null;

  return (
    <Stage tone="reel">
      <QuestionScreen
        key={question.id}
        question={question}
        phases={pack.phases}
        index={step - 1}
        selected={selected}
        onSelect={(optionId) => choose(question.id, optionId)}
        onConfirm={() => {
          if (!selected) return;
          if (step >= pack.questions.length) {
            void warmupHero();
            void navigate({ to: "/r" });
            return;
          }
          void withStepTransition("forward", () =>
            navigate({
              to: "/q/$step",
              params: { step: String(step + 1) },
            }),
          );
        }}
      />
    </Stage>
  );
}
