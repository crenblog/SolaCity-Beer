import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { IntroScreen } from "@/components/intro-screen";
import { Stage } from "@/components/stage";
import { useLedger, warmupLoadType } from "@/lib/thin-path";

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
