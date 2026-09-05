import type { Item } from "@/shared/types";
import { wrapJa } from "@/result/wrap-ja";

/** 기기에서 그리는 카드 3장. 서버 합성 없음. 미리보기와 저장이 같은 paint. */
export const CARD_TEMPLATES = ["picture", "words", "place"] as const;
export type CardTemplate = (typeof CARD_TEMPLATES)[number];

/** 세 장 모두 종이 위에 병. 앨범 커버가 빠지지 않는 것과 같다. */
export const CARD_LABEL: Record<CardTemplate, string> = {
  picture: "絵",
  words: "ことば",
  place: "場所",
};

const W0 = 1080;
const H0 = 1920;
const PAPER = "#f3eee4";
const INK = "#1c1b18";
const MUTE = "#8a8680";
const SAGE = "#6d7a5c";

const bottleCache = new Map<string, HTMLImageElement>();

export function loadBottle(item: Item): Promise<HTMLImageElement> {
  const src = item.art ?? "/images/bottle.png?v=4";
  const hit = bottleCache.get(src);
  if (hit?.complete) return Promise.resolve(hit);
  const img = new Image();
  img.src = src;
  return img.decode().then(() => {
    bottleCache.set(src, img);
    return img;
  });
}

function wrapChars(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  if (ctx.measureText(text).width <= max) return [text];
  const lines: string[] = [];
  let cur = "";
  for (const ch of text) {
    const next = cur + ch;
    if (ctx.measureText(next).width > max && cur) {
      lines.push(cur);
      cur = ch;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  if (ctx.measureText(text).width <= max) return [text];
  const clauses = wrapJa(text);
  const lines: string[] = [];
  let cur = "";
  for (const clause of clauses) {
    const next = cur + clause;
    if (cur && ctx.measureText(next).width > max) {
      lines.push(cur);
      cur = clause;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines.flatMap((line) => wrapChars(ctx, line, max));
}

function drawBottle(
  ctx: CanvasRenderingContext2D,
  bottle: HTMLImageElement,
  cx: number,
  y: number,
  h: number,
  s: number,
) {
  const w = h * (bottle.naturalWidth / bottle.naturalHeight);
  ctx.save();
  ctx.shadowColor = "rgba(28, 27, 24, 0.28)";
  ctx.shadowBlur = 48 * s;
  ctx.shadowOffsetY = 22 * s;
  ctx.drawImage(bottle, cx - w / 2, y, w, h);
  ctx.restore();
}

function fitSize(ctx: CanvasRenderingContext2D, text: string, max: number, start: number): number {
  let size = start;
  ctx.font = `500 ${size}px "Noto Serif JP", serif`;
  while (size > 48 && ctx.measureText(text).width > max) {
    size -= 6;
    ctx.font = `500 ${size}px "Noto Serif JP", serif`;
  }
  return size;
}

function paint(
  ctx: CanvasRenderingContext2D,
  item: Item,
  bottle: HTMLImageElement,
  template: CardTemplate,
  W: number,
  H: number,
) {
  const s = W / W0;
  const pad = 88 * s;
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = "top";

  if (template === "words") {
    // DUSTED: 이름이 병 뒤로 세 번. 제품이 글자를 가린다.
    ctx.fillStyle = MUTE;
    ctx.font = `400 ${20 * s}px "Noto Sans JP", sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(`${item.style}  ·  ${item.abv}`, W / 2, 88 * s);

    const word = item.name;
    let size = 140 * s;
    ctx.font = `500 ${size}px "Noto Serif JP", serif`;
    while (ctx.measureText(word).width < W * 1.06 && size < 200 * s) {
      size += 4;
      ctx.font = `500 ${size}px "Noto Serif JP", serif`;
    }
    ctx.fillStyle = "#9d8b7a";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    // 残像. 1行目が本体、下へいくほど透明. DUSTED の埃.
    const lead = size * 1.1;
    const startY = 300 * s;
    const fade = [0.5, 0.28, 0.14];
    fade.forEach((alpha, i) => {
      ctx.globalAlpha = alpha;
      ctx.fillText(word, W / 2, startY + i * lead);
    });
    ctx.globalAlpha = 1;

    ctx.textBaseline = "top";
    drawBottle(ctx, bottle, W / 2, 380 * s, 1040 * s, s);

    ctx.fillStyle = INK;
    ctx.font = `italic 400 ${40 * s}px "Noto Serif JP", serif`;
    ctx.textAlign = "center";
    ctx.fillText("今夜", W / 2, 1520 * s);

    ctx.fillStyle = MUTE;
    ctx.font = `400 ${24 * s}px "Noto Sans JP", sans-serif`;
    wrapText(ctx, item.line, W - pad * 2).forEach((line, i) => {
      ctx.fillText(line, W / 2, 1600 * s + i * 36 * s);
    });
    return;
  }

  if (template === "place") {
    // FILLED: 이름이 한 덩어리로 크게. 부스 번호가 주인공이 아님.
    ctx.fillStyle = MUTE;
    ctx.font = `italic 400 ${34 * s}px "Noto Serif JP", serif`;
    ctx.textAlign = "left";
    ctx.fillText(item.style.toLowerCase(), pad, 120 * s);

    const chars = [...item.name];
    const cut = Math.ceil(chars.length / 2);
    const lines = [chars.slice(0, cut).join(""), chars.slice(cut).join("")].filter(Boolean);
    const longest = lines.reduce((a, b) => (a.length >= b.length ? a : b));
    const size = fitSize(ctx, longest, W - pad * 1.15, 260 * s);
    ctx.fillStyle = "#3a2c22";
    ctx.font = `500 ${size}px "Noto Serif JP", serif`;
    lines.forEach((line, i) => {
      ctx.fillText(line, pad, 200 * s + i * size * 0.98);
    });

    const nameBlock = 200 * s + lines.length * size * 0.98;
    drawBottle(ctx, bottle, W / 2, nameBlock - 80 * s, 920 * s, s);

    ctx.fillStyle = INK;
    ctx.font = `400 ${28 * s}px "Noto Sans JP", sans-serif`;
    ctx.textAlign = "center";
    wrapText(ctx, item.line, W - pad * 2).forEach((line, i) => {
      ctx.fillText(line, W / 2, 1560 * s + i * 42 * s);
    });
    ctx.fillStyle = MUTE;
    ctx.font = `500 ${20 * s}px "Noto Sans JP", sans-serif`;
    ctx.fillText(`${item.booth}  ·  ${item.place}`, W / 2, 1720 * s);
    return;
  }

  ctx.fillStyle = MUTE;
  ctx.font = `500 ${24 * s}px "Noto Sans JP", sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText(item.style, pad, 110 * s);
  ctx.textAlign = "right";
  ctx.fillText(item.abv, W - pad, 110 * s);

  ctx.fillStyle = SAGE;
  ctx.font = `500 ${148 * s}px "Noto Serif JP", serif`;
  ctx.textAlign = "center";
  wrapText(ctx, item.name, W - pad * 1.4).forEach((line, i) => {
    ctx.fillText(line, W / 2, 220 * s + i * 160 * s);
  });

  drawBottle(ctx, bottle, W / 2, 400 * s, 980 * s, s);

  ctx.fillStyle = MUTE;
  ctx.font = `400 ${28 * s}px "Noto Sans JP", sans-serif`;
  wrapText(ctx, item.line, W - pad * 2).forEach((line, i) => {
    ctx.fillText(line, W / 2, 1500 * s + i * 42 * s);
  });
  ctx.textAlign = "left";
  ctx.font = `500 ${22 * s}px "Noto Sans JP", sans-serif`;
  ctx.fillText(item.place, pad, 1720 * s);
}

export async function renderCard(
  item: Item,
  template: CardTemplate,
  width = W0,
): Promise<Blob> {
  await document.fonts.ready;
  const bottle = await loadBottle(item);
  const W = width;
  const H = Math.round((width * H0) / W0);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  paint(ctx, item, bottle, template, W, H);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.92),
  );
  if (!blob) throw new Error("blob");
  return blob;
}

export async function shareCard(item: Item, template: CardTemplate) {
  const blob = await renderCard(item, template, W0);
  const name = item.poster.filename.replace(/\.png$/i, ".jpg");
  const file = new File([blob], name, { type: "image/jpeg" });
  const nav = navigator as Navigator & {
    share?: (data: ShareData) => Promise<void>;
    canShare?: (data: ShareData) => boolean;
  };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: item.name });
      return;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
