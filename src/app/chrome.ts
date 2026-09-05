/** Safari theme-color는 하나. 화면 위·아래 띠를 따로 읽어 html 그라데이션에 넣는다. */

export type ChromeSample = { top: string; bot: string; mix: string };

const cache = new Map<string, ChromeSample>();

function hex(r: number, g: number, b: number): string {
  const to = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

function strip(ctx: CanvasRenderingContext2D, y: number, h: number, w: number) {
  const { data } = ctx.getImageData(0, y, w, Math.max(1, h));
  let r = 0;
  let g = 0;
  let b = 0;
  const n = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i] ?? 0;
    g += data[i + 1] ?? 0;
    b += data[i + 2] ?? 0;
  }
  return { r: r / n, g: g / n, b: b / n };
}

function fromCanvas(ctx: CanvasRenderingContext2D, w: number, h: number): ChromeSample {
  // 상태바·툴바에 실제로 붙는 위·아래 20%.
  const band = Math.max(2, Math.round(h * 0.2));
  const top = strip(ctx, 0, band, w);
  const bot = strip(ctx, h - band, band, w);
  return {
    top: hex(top.r, top.g, top.b),
    bot: hex(bot.r, bot.g, bot.b),
    mix: hex((top.r + bot.r) / 2, (top.g + bot.g) / 2, (top.b + bot.b) / 2),
  };
}

export async function samplePosterChrome(src: string): Promise<ChromeSample> {
  const hit = cache.get(src);
  if (hit) return hit;
  const img = new Image();
  img.src = src;
  await img.decode();
  const w = 64;
  const h = 64;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { top: "#1c1b18", bot: "#1c1b18", mix: "#1c1b18" };
  ctx.drawImage(img, 0, 0, w, h);
  const sample = fromCanvas(ctx, w, h);
  cache.set(src, sample);
  return sample;
}

/** 지금 프레임. 포스터(중간 장면)가 아니라 실제로 보이는 위·아래. */
export function sampleVideoChrome(video: HTMLVideoElement): ChromeSample | null {
  if (video.readyState < 2 || video.videoWidth < 2) return null;
  const w = 64;
  const h = 64;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, w, h);
  return fromCanvas(ctx, w, h);
}

export function chromeIsDark(color: string): boolean {
  const n = Number.parseInt(color.slice(1), 16);
  const r = (n >> 16) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.45;
}

const INK = "#1c1b18";

export function applyThemeColor(color: string, overlay: boolean, ends?: { top: string; bot: string }) {
  const dark = chromeIsDark(color);
  const root = document.documentElement;
  const top = ends?.top ?? color;
  const bot = ends?.bot ?? color;
  const fill = top === bot ? color : `linear-gradient(${top}, ${bot})`;
  root.style.background = fill;
  document.body.style.background = fill;
  const app = document.getElementById("app");
  if (app) app.style.background = fill;
  root.style.colorScheme = dark ? "dark" : "light";
  root.style.setProperty("--reel-chrome", color);
  root.style.setProperty("--reel-chrome-top", top);
  root.style.setProperty("--reel-chrome-bot", bot);

  // iOS는 시스템 다크면 media 없는 theme-color를 버린다. 아래 바는 장면 아래 띠.
  const bar = bot;
  document.querySelectorAll("meta[name='theme-color']").forEach((node) => node.remove());
  for (const media of ["(prefers-color-scheme: light)", "(prefers-color-scheme: dark)", ""]) {
    const theme = document.createElement("meta");
    theme.setAttribute("name", "theme-color");
    theme.setAttribute("content", bar);
    if (media) theme.setAttribute("media", media);
    document.head.appendChild(theme);
  }

  let status = document.querySelector("meta[name='apple-mobile-web-app-status-bar-style']");
  if (!status) {
    status = document.createElement("meta");
    status.setAttribute("name", "apple-mobile-web-app-status-bar-style");
    document.head.appendChild(status);
  }
  status.setAttribute("content", overlay && dark ? "black-translucent" : "default");
}

export function applyInkChrome() {
  applyThemeColor(INK, true);
}

export function bindVisualViewport() {
  const apply = () => {
    const h = window.visualViewport?.height ?? window.innerHeight;
    document.documentElement.style.setProperty("--vvh", `${h}px`);
  };
  apply();
  window.visualViewport?.addEventListener("resize", apply);
  window.visualViewport?.addEventListener("scroll", apply);
  window.addEventListener("resize", apply);
  return () => {
    window.visualViewport?.removeEventListener("resize", apply);
    window.visualViewport?.removeEventListener("scroll", apply);
    window.removeEventListener("resize", apply);
  };
}
