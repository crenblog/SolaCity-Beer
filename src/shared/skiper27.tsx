import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Skiper UI skiper27 — RollingText. 글자가 흩어졌다가 겹치며 다음 문장에 맞춰진다. */

type RollingTextProps = {
  text?: string;
  texts?: string[];
  speed?: number;
  duration?: number;
  className?: string;
  live?: boolean;
};

function hash(i: number, seed: number) {
  const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function scatter(i: number, seed: number) {
  const a = hash(i, seed);
  const b = hash(i + 3, seed + 1);
  return {
    y: (a - 0.5) * 160,
    x: (b - 0.5) * 72,
    rotate: (a - 0.5) * 18,
  };
}

export function RollingText({
  text,
  texts,
  speed = 0.05,
  duration = 4,
  className,
  live = true,
}: RollingTextProps) {
  const lines = texts?.length ? texts : [text ?? ""];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!live) return;
    if (lines.length < 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = window.setInterval(() => {
      setIndex((n) => (n + 1) % lines.length);
    }, duration * 1000);
    return () => window.clearInterval(t);
  }, [duration, lines.length, live]);

  const current = lines[index] ?? "";
  const rows = current.split("\n");
  const chars = rows.join("");
  const mid = Math.max(chars.length - 1, 1) / 2;
  const seed = index + 1;
  const roll = Math.min(1.35, duration * 0.34);
  let n = 0;

  return (
    <span className={cn("relative inline-grid place-items-center", className)}>
      <AnimatePresence>
        <motion.span
          key={index}
          className="col-start-1 row-start-1 inline-block text-center"
        >
          {rows.map((row, r) => (
            <span key={`${index}-r${r}`} className="block whitespace-nowrap">
              {[...row].map((ch, i) => {
                const gi = n++;
                const dist = Math.abs(gi - mid);
                const enter = scatter(gi, seed);
                const leave = scatter(gi, seed + 11);
                const hang = i === row.length - 1 && (ch === "。" || ch === "、");
                return (
                  <motion.span
                    key={`${index}-${r}-${i}`}
                    className={hang ? "inline-block -me-[0.45em]" : "inline-block"}
                    initial={{ ...enter, opacity: 0 }}
                    animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                    exit={{ ...leave, opacity: 0 }}
                    transition={{
                      duration: roll,
                      delay: dist * speed,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {ch === " " ? "\u00a0" : ch}
                  </motion.span>
                );
              })}
            </span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
