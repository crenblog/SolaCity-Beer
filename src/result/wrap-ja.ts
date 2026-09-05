/** 길면 読点 、에서 줄을 바꾼다. */
export function wrapJa(text: string): string[] {
  if (!text.includes("、")) return [text];
  return text
    .split("、")
    .map((part, i, all) => {
      const t = part.trim();
      if (!t) return "";
      return i < all.length - 1 ? `${t}、` : t;
    })
    .filter(Boolean);
}
