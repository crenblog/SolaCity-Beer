import { useEffect, useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** 글자만 감싸면 일렁인다. スタート뿐 아니라 어디든. <SquigglyText>텍스트</SquigglyText> */

export function SquigglyText({
  children,
  className,
  scale = 3,
}: {
  children: ReactNode;
  className?: string;
  /** 일렁임 세기. 본문 3, 큰 제목 5–6. */
  scale?: number;
}) {
  const raw = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const filterId = `squiggle-${raw}`;
  const reduce = usePrefersReducedMotion();

  if (reduce) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span
      className={cn("inline-block px-[0.12em]", className)}
      style={{ filter: `url(#${filterId})` }}
    >
      <svg aria-hidden="true" className="pointer-events-none absolute h-0 w-0">
        <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
          <feTurbulence
            type="fractalNoise"
            numOctaves="2"
            result="noise"
            seed="2"
          >
            <animate
              attributeName="baseFrequency"
              dur="2.6s"
              values="0.012;0.055;0.012"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={scale}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      {children}
    </span>
  );
}

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduce;
}
