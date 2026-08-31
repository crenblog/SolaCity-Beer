/** Safari theme-color는 하나뿐. 포스터 위·아래 띠를 섞어 바에 넣는다. */

const cache = new Map<string, string>();

function hex(r: number, g: number, b: number): string {
  const to = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

function strip(ctx: CanvasRenderingContext2D, y: number, h: number, w: number) {
  const { data } = ctx.getImageData(0, y, w, h);
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

export async function samplePosterChrome(src: string): Promise<string> {
  const hit = cache.get(src);
  if (hit) return hit;
  const img = new Image();
  img.src = src;
  await img.decode();
  const w = 32;
  const h = 32;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return "#1c1b18";
  ctx.drawImage(img, 0, 0, w, h);
  const top = strip(ctx, 0, 4, w);
  const bot = strip(ctx, h - 5, 5, w);
  const color = hex((top.r + bot.r) / 2, (top.g + bot.g) / 2, (top.b + bot.b) / 2);
  cache.set(src, color);
  return color;
}

export function chromeIsDark(color: string): boolean {
  const n = Number.parseInt(color.slice(1), 16);
  const r = (n >> 16) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.45;
}

export function applyThemeColor(color: string, overlay: boolean) {
  const dark = chromeIsDark(color);
  const root = document.documentElement;
  root.style.background = color;
  document.body.style.background = color;
  root.style.colorScheme = dark ? "dark" : "light";
  root.style.setProperty("--reel-chrome", color);

  // iOS는 시스템 다크면 media 없는 theme-color를 버린다. 둘 다 이 화면 색.
  document.querySelectorAll("meta[name='theme-color']").forEach((node) => node.remove());
  for (const media of ["(prefers-color-scheme: light)", "(prefers-color-scheme: dark)", ""]) {
    const theme = document.createElement("meta");
    theme.setAttribute("name", "theme-color");
    theme.setAttribute("content", color);
    if (media) theme.setAttribute("media", media);
    document.head.appendChild(theme);
  }

  let bar = document.querySelector("meta[name='apple-mobile-web-app-status-bar-style']");
  if (!bar) {
    bar = document.createElement("meta");
    bar.setAttribute("name", "apple-mobile-web-app-status-bar-style");
    document.head.appendChild(bar);
  }
  bar.setAttribute("content", overlay && dark ? "black-translucent" : "default");
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
