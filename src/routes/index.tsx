import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { IntroScreen } from "@/screens/intro-screen";
import { Stage } from "@/screens/stage";
import { useLedger, warmupLoadType } from "@/app";

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
