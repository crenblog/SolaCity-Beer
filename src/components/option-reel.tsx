import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { mediaSrc, neighborIds, pickVideo, prefetchNeighbors, readMediaGate, subscribeMedia, swapToHiWhenReady } from "@/lib/thin-path/gate";
import { applyInkChrome, applyThemeColor, samplePosterChrome, sampleVideoChrome } from "@/lib/thin-path/chrome";
import type { Option } from "@/lib/thin-path/types";
import { cn } from "@/lib/utils";

type Slide = {
  option: Option;
  key: string;
  clone: boolean;
};

export function OptionReel({
  options,
  selected,
  onSelect,
  labelledBy,
  live = true,
}: {
  options: Option[];
  selected: string | null;
  onSelect: (id: string) => void;
  labelledBy: string;
  live?: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const videosRef = useRef<(HTMLVideoElement | null)[]>([]);
  const restored = useRef(false);
  const [rich, setRich] = useState(() =>
    typeof window === "undefined" ? false : readMediaGate().richMedia,
  );

  const loop = options.length > 1;
  const last = options[options.length - 1];
  const first = options[0];
  // 끝에서 다시 처음으로. 앞뒤 클론을 붙이고 scrollend에서 점프.
  const slides: Slide[] =
    loop && last && first
      ? [
          { option: last, key: "before", clone: true },
          ...options.map((option) => ({ option, key: option.id, clone: false })),
          { option: first, key: "after", clone: true },
        ]
      : options.map((option) => ({ option, key: option.id, clone: false }));

  // 지금·앞·뒤 세 장만 네트워크에 올린다. 지정 영상이 먼저 도착하게.
  const currentId = selected ?? options[0]?.id ?? null;
  const hot = neighborIds(
    options.map((o) => o.id),
    currentId,
  );

  useEffect(() => {
    setRich(readMediaGate().richMedia);
  }, [options]);

  useEffect(() => {
    prefetchNeighbors(options, currentId);
  }, [options, currentId]);

  useEffect(() => {
    if (!live) {
      applyInkChrome();
      return;
    }
    const option = options.find((item) => item.id === currentId);
    if (!option) return;
    let gone = false;

    const paint = (sample: { top: string; bot: string; mix: string }) => {
      if (!gone) applyThemeColor(sample.mix, true, sample);
    };

    const fromVideo = () => {
      const video = videosRef.current.find((node) => node && !node.paused) ?? videosRef.current.find(Boolean);
      if (!video) return false;
      const sample = sampleVideoChrome(video);
      if (!sample) return false;
      paint(sample);
      return true;
    };

    void samplePosterChrome(option.poster).then((sample) => {
      if (!gone && !fromVideo()) paint(sample);
    });

    const id = window.setInterval(() => {
      if (fromVideo()) window.clearInterval(id);
    }, 180);
    const stop = window.setTimeout(() => window.clearInterval(id), 4000);
    return () => {
      gone = true;
      window.clearInterval(id);
      window.clearTimeout(stop);
    };
  }, [currentId, live, options]);

  useLayoutEffect(() => {
    const root = scrollerRef.current;
    if (!root || restored.current) return;
    const id = selected ?? options[0]?.id;
    const index = options.findIndex((o) => o.id === id);
    if (index < 0) return;
    const slot = loop ? index + 1 : index;
    root.scrollTop = root.clientHeight * slot;
    restored.current = true;
  }, [loop, options, selected]);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    const wrap = () => {
      if (!loop) return;
      const h = root.clientHeight;
      if (h === 0) return;
      const i = root.scrollTop / h;
      const n = options.length;
      if (i < 0.02) root.scrollTop = h * n;
      else if (i > n + 0.98) root.scrollTop = h;
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          const id = el.dataset.optionId;
          const idx = Number(el.dataset.slide);
          const video = videosRef.current[idx];
          const on = entry.isIntersecting && entry.intersectionRatio >= 0.55;
          if (on) {
            if (id) onSelect(id);
            if (video && rich) {
              void video.play().catch(() => undefined);
              // 지정 압축본이 나온 뒤에만 1080 시도. 없으면 그냥 압축본.
              const opt = options.find((o) => o.id === id);
              swapToHiWhenReady(video, opt?.videoHi);
            }
          } else if (video) {
            video.pause();
          }
        }
      },
      { root, threshold: [0.55] },
    );

    for (const child of Array.from(root.children)) io.observe(child);
    root.addEventListener("scrollend", wrap);
    return () => {
      io.disconnect();
      root.removeEventListener("scrollend", wrap);
    };
  }, [loop, onSelect, options.length, rich]);

  function go(delta: number) {
    const root = scrollerRef.current;
    if (!root) return;
    const h = root.clientHeight;
    const current = Math.round(root.scrollTop / h);
    const next = current + delta;
    const child = root.children[next] as HTMLElement | undefined;
    if (child) {
      child.scrollIntoView({ block: "start", behavior: "smooth" });
      return;
    }
    if (!loop || slides.length === 0) return;
    const wrapTo = delta > 0 ? 1 : slides.length - 2;
    const target = root.children[wrapTo] as HTMLElement | undefined;
    target?.scrollIntoView({ block: "start", behavior: "instant" });
  }

  return (
    <div className="absolute inset-0 reel-chrome-fill">
      <div
        ref={scrollerRef}
        role="radiogroup"
        aria-labelledby={labelledBy}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowRight") {
            e.preventDefault();
            go(1);
          }
          if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
            e.preventDefault();
            go(-1);
          }
        }}
        className="reel-scroller flex h-full snap-y snap-mandatory flex-col overflow-y-scroll overscroll-y-contain touch-pan-y"
      >
        {slides.map((slide, i) => {
          const active = !slide.clone && currentId === slide.option.id;
          const ready = hot.has(slide.option.id);
          return (
            <article
              key={slide.key}
              data-option-id={slide.option.id}
              data-slide={i}
              role={slide.clone ? undefined : "radio"}
              aria-hidden={slide.clone || undefined}
              aria-checked={slide.clone ? undefined : active}
              aria-label={slide.clone ? undefined : slide.option.label}
              className="relative h-full w-full shrink-0 basis-full snap-start snap-always"
            >
              {/* 포스터가 먼저 숨 쉬듯. 영상은 첫 프레임이 오면 그 위에 녹는다. */}
              {ready ? (
                <SlideMedia
                  option={slide.option}
                  active={active}
                  rich={rich}
                  videoRef={(node) => {
                    videosRef.current[i] = node;
                  }}
                />
              ) : (
                <img
                  src={slide.option.poster}
                  alt=""
                  draggable={false}
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                />
              )}
            </article>
          );
        })}
      </div>

      <ol
        className="pointer-events-none absolute right-3 top-[46%] z-10 flex -translate-y-1/2 flex-col gap-2"
        aria-hidden="true"
      >
        {options.map((option) => (
          <li
            key={option.id}
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-opacity duration-[var(--motion-quick)] ease-[var(--ease-out)]",
              selected === option.id || (!selected && option.id === currentId) ? "bg-paper opacity-100" : "bg-paper opacity-35",
            )}
          />
        ))}
      </ol>
    </div>
  );
}

function SlideMedia({
  option,
  active,
  rich,
  videoRef,
}: {
  option: Option;
  active: boolean;
  rich: boolean;
  videoRef: (node: HTMLVideoElement | null) => void;
}) {
  const url = pickVideo(option);
  // 통째 blob만 재생. 파일 안 장면은 안 본다. 스트리밍하면 저속에서 끊긴다.
  const [src, setSrc] = useState(() => mediaSrc(url));
  const nodeRef = useRef<HTMLVideoElement | null>(null);
  const buffered = src.startsWith("blob:");

  useEffect(() => subscribeMedia(url, setSrc), [url]);

  useEffect(() => {
    const el = nodeRef.current;
    if (!rich || !active || !el) return;
    el.muted = true;
    const kick = () => {
      if (el.paused) void el.play().catch(() => undefined);
    };
    if (active) kick();
    const id = window.setInterval(kick, 400);
    return () => window.clearInterval(id);
  }, [active, rich, src]);

  return (
    <>
      <img
        src={option.poster}
        alt=""
        draggable={false}
        fetchPriority={active ? "high" : "low"}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      {rich && buffered ? (
        <video
          ref={(node) => {
            nodeRef.current = node;
            videoRef(node);
          }}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          poster={option.poster}
          src={src}
          muted
          loop
          playsInline
          autoPlay={active}
          preload="auto"
        />
      ) : null}
    </>
  );
}
