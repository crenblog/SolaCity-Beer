import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { IntroScreen } from "@/intro/intro-screen";
import { Stage } from "@/shared/stage";
import { useLedger, warmupLoadType } from "@/shared";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const hydrate = useLedger((s) => s.hydrate);

  useEffect(() => {
    hydrate();
    void warmupLoadType();
  }, [hydrate]);

  return (
    <Stage>
      <IntroScreen />
    </Stage>
  );
}
