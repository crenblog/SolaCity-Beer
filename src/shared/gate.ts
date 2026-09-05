export type MediaGate = {
  reducedMotion: boolean;
  saveData: boolean;
  /** 압축 루프를 재생해도 되는 환경인가. 포스터는 항상. */
  richMedia: boolean;
};

function connection() {
  if (typeof navigator === "undefined") return undefined;
  return (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
}

/**
 * 영상 내용과 무관한 받는 쪽.
 *
 * 압축은 scripts/compress-media.sh. 여기는 파일을 열지 않는다.
 * 어떤 장면이든 같은 순서다.
 *
 * 1. 포스터 JPG     첫 페인트. AVIF 디코드는 아이폰에서 느려서 안 씀.
 * 2. videoAv1       Chrome·Safari 17. canPlayType probably. 파일 있을 때만.
 * 3. videoHevc      iOS. hvc1. probably일 때만.
 * 4. video          H.264 High 1080. 나머지.
 * src는 항상 하나. <source> 두 줄은 Chrome이 HEVC를 집고 죽는다.
 * +faststart. HLS 없음.
 *
 * 재생은 blob URL만. 스트리밍하면 저속에서 첫 프레임이 끊긴다.
 * 앞 두 장(질문1의 0,1)을 파일 끝까지 받은 뒤에 입장. 3장째부터는 이웃만.
 */
export function readMediaGate(): MediaGate {
  if (typeof window === "undefined") {
    return { reducedMotion: true, saveData: false, richMedia: false };
  }
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const conn = connection();
  const saveData = Boolean(conn?.saveData);
  const verySlow = conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g";
  const richMedia = !reducedMotion;
  return { reducedMotion, saveData, richMedia };
}

/** 1080은 빠른 망에서만. 지정 압축본을 기다리지 않게. */
export function canUpgradeToHi(): boolean {
  const conn = connection();
  return Boolean(conn && conn.effectiveType === "4g" && !conn.saveData);
}

/**
 * 작은 지정 영상이 재생된 뒤에만 1080을 받아 갈아끼운다.
 * videoHi가 없으면 아무 것도 안 한다.
 */
export function swapToHiWhenReady(el: HTMLVideoElement, videoHi?: string) {
  if (!videoHi || !canUpgradeToHi()) return;
  const probe = document.createElement("video");
  probe.muted = true;
  probe.preload = "auto";
  probe.src = videoHi;
  probe.addEventListener(
    "canplaythrough",
    () => {
      const t = el.currentTime;
      el.src = videoHi;
      el.currentTime = t;
      void el.play().catch(() => undefined);
    },
    { once: true },
  );
}

/** 지금 장 + 앞뒤만 받는다. 다섯 장을 한꺼번에 받지 않음. */
export function neighborIds(ids: string[], selected: string | null): Set<string> {
  if (ids.length === 0) return new Set();
  const i = Math.max(0, ids.findIndex((id) => id === selected));
  const n = ids.length;
  const near = new Set<string>();
  for (const d of [-1, 0, 1]) {
    const id = ids[(i + d + n) % n];
    if (id) near.add(id);
  }
  return near;
}

/** 기기마다 파일 하나. 장면은 안 본다. AV1 → HEVC → H.264. */
export function pickVideo(option: { video: string; videoHevc?: string; videoAv1?: string }) {
  if (typeof document === "undefined") return option.video;
  const probe = document.createElement("video");
  if (option.videoAv1 && probe.canPlayType('video/mp4; codecs="av01.0.05M.08"') === "probably") {
    return option.videoAv1;
  }
  if (option.videoHevc && probe.canPlayType('video/mp4; codecs="hvc1"') === "probably") {
    return option.videoHevc;
  }
  return option.video;
}

const blobs = new Map<string, string>();
const listeners = new Set<(url: string) => void>();

export function mediaSrc(url: string) {
  return blobs.get(url) ?? url;
}

export function subscribeMedia(url: string, onChange: (src: string) => void) {
  const emit = (changed: string) => {
    if (changed === url) onChange(mediaSrc(url));
  };
  listeners.add(emit);
  onChange(mediaSrc(url));
  return () => {
    listeners.delete(emit);
  };
}

function rememberBlob(url: string, blob: Blob) {
  const prev = blobs.get(url);
  if (prev) URL.revokeObjectURL(prev);
  blobs.set(url, URL.createObjectURL(blob));
  for (const fn of listeners) fn(url);
}

const inflight = new Map<string, Promise<void>>();

/**
 * 파일을 통째로 메모리에 둔다. 안의 영상이 달라도 같은 fetch.
 * 받은 뒤에만 재생해서 저속에서 첫 프레임이 끊기지 않게.
 */
export function cacheVideo(url: string) {
  if (typeof fetch === "undefined") return Promise.resolve();
  if (blobs.has(url)) return Promise.resolve();
  const hit = inflight.get(url);
  if (hit) return hit;
  const job = fetch(url, { cache: "force-cache" })
    .then(async (res) => {
      if (!res.ok) return;
      const blob = await res.blob();
      if (blob.size > 1024) rememberBlob(url, blob);
    })
    .catch(() => undefined)
    .finally(() => inflight.delete(url));
  inflight.set(url, job);
  return job;
}

type OptionMedia = { id?: string; poster: string; video: string; videoHevc?: string; videoAv1?: string };

/** 숨은 video. 다운로드를 끊지 않는다. iOS는 muted play→pause 로 버퍼를 연다. */
const parked = new Map<string, HTMLVideoElement>();

function parkPreload(url: string, priority: "high" | "low" = "low") {
  if (typeof document === "undefined" || !url) return;
  if (!parked.has(url)) {
    const v = document.createElement("video");
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.setAttribute("playsinline", "");
    v.preload = "auto";
    v.setAttribute("preload", "auto");
    v.setAttribute("aria-hidden", "true");
    v.tabIndex = -1;
    v.style.cssText = "position:fixed;left:-99px;top:0;width:1px;height:1px;opacity:0;pointer-events:none";
    document.body.appendChild(v);
    parked.set(url, v);
    v.src = url;
    void v.play().then(() => v.pause()).catch(() => undefined);
  }
  if (priority === "high") {
    const id = `preload-video-${url}`;
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "preload";
      link.as = "video";
      link.href = url;
      link.setAttribute("fetchpriority", "high");
      document.head.appendChild(link);
    }
  }
}

/** 통째로 올 때까지. 앞 한두 장은 이걸로만 재생을 연다. */
export function waitVideoReady(url: string, _fraction = 0.5, maxMs = 45000) {
  return Promise.race([
    cacheVideo(url),
    new Promise<void>((resolve) => window.setTimeout(resolve, maxMs)),
  ]);
}

export function prefetchPosters(options: OptionMedia[]) {
  if (typeof document === "undefined") return;
  for (const option of options) {
    const img = new Image();
    img.decoding = "async";
    img.src = option.poster;
  }
}

/** 지금 장 + 앞뒤만. 통째로 받은 것만 재생. */
export function prefetchNeighbors(options: OptionMedia[], selected: string | null) {
  if (typeof document === "undefined" || options.length === 0) return;
  prefetchPosters(options);
  const ids = options.map((o) => o.id).filter((id): id is string => Boolean(id));
  const hot = neighborIds(ids, selected);
  for (const option of options) {
    if (!option.id || !hot.has(option.id)) continue;
    void cacheVideo(pickVideo(option));
  }
}

/** 포스터는 전부, 영상은 앞 두 장만 통째로. */
export function prefetchQuestion(options: (OptionMedia & { id?: string })[]) {
  if (typeof document === "undefined" || options.length === 0) return;
  prefetchPosters(options);
  const first = options[0];
  const second = options[1];
  if (first) void cacheVideo(pickVideo(first));
  if (second) void cacheVideo(pickVideo(second));
}

/**
 * 스타트. 앞 두 장을 파일 끝까지 받은 뒤에 입장.
 * 과일·빵·바다 무엇이든 여기 경로만. 내용은 압축 스크립트가 이미 맞춰 둠.
 * 받은 blob으로만 재생. 45초 안에 안 오면 포스터만 두고 입장.
 */
export function warmupPath(questions: { options: (OptionMedia & { id?: string })[] }[]) {
  const q1 = questions[0];
  if (!q1 || q1.options.length === 0) return Promise.resolve();
  prefetchPosters(q1.options);
  const firstTwo = q1.options.slice(0, 2);
  return Promise.race([
    Promise.all(firstTwo.map((option) => cacheVideo(pickVideo(option)))),
    new Promise<void>((resolve) => window.setTimeout(resolve, 45000)),
  ]);
}

export function avifOf(poster: string) {
  return poster.replace(/\.jpg(\?.*)?$/, ".avif$1");
}

export function waitImage(src: string) {
  if (typeof window === "undefined") return Promise.resolve();
  return new Promise<void>((resolve) => {
    const img = new Image();
    const done = () => resolve();
    img.onload = done;
    img.onerror = done;
    img.src = src;
    if (img.complete) done();
  });
}

const HERO = "/images/bottle.png?v=4";

/** 로딩 글자. 스타트 전에 서체만 풀어 둔다. 영상보다 먼저. */
export function warmupLoadType() {
  if (typeof document === "undefined" || !document.fonts?.load) return Promise.resolve();
  return Promise.race([
    Promise.all([
      document.fonts.load('500 2.75rem "Noto Serif JP"', "グラスを置く。泡が立つ。今夜、はじまる。"),
      document.fonts.load('500 0.7rem "Noto Sans JP"', "今夜の一杯"),
    ]),
    new Promise<void>((res) => window.setTimeout(res, 1200)),
  ]).then(() => undefined);
}
export async function warmupHero() {
  if (typeof window === "undefined") return;
  const img = new Image();
  img.src = HERO;
  const pic = img.decode ? img.decode().catch(() => undefined) : waitImage(HERO);
  const type =
    document.fonts?.load != null
      ? Promise.race([
          document.fonts.load('500 4.5rem "Noto Serif JP"', "漢あ"),
          new Promise<void>((res) => window.setTimeout(res, 700)),
        ])
      : Promise.resolve();
  await Promise.all([pic, type]);
}
