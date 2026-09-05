import { useEffect, type ReactNode } from "react";
import { applyThemeColor, bindVisualViewport } from "@/app/chrome";
import { cn } from "@/lib/utils";

const CHROME: Record<"paper" | "result" | "reel", string> = {
  paper: "#f4f1ec",
  result: "#f3eee4",
  reel: "#1c1b18",
};

function useChrome(tone: "paper" | "result" | "reel") {
  useEffect(() => {
    applyThemeColor(CHROME[tone], tone === "reel");
  }, [tone]);

  useEffect(() => {
    if (tone !== "reel") return;
    return bindVisualViewport();
  }, [tone]);
}

export function Stage({
  children,
  tone = "paper",
}: {
  children: ReactNode;
  tone?: "paper" | "result" | "reel";
}) {
  useChrome(tone);
  return (
    <div
      className={cn(
        "flex justify-center",
        tone === "reel" ? "h-[var(--vvh,100dvh)] reel-chrome-fill" : "min-h-dvh min-h-[100svh] bg-letterbox",
      )}
    >
      <div
        className={cn(
          "relative flex w-full max-w-stage flex-col text-ink",
          tone === "result"
            ? "h-dvh min-h-dvh min-h-[100svh] overflow-x-hidden overflow-y-auto overscroll-y-contain bg-result"
            : tone === "reel"
              ? "h-full overflow-hidden reel-chrome-fill"
              : "min-h-dvh min-h-[100svh] overflow-hidden bg-paper",
        )}
      >
        {children}
      </div>
    </div>
  );
}
