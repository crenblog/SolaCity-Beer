import { useEffect, useRef } from "react";

/** 추천 첫 장 스크롤만. 지나면 --ca 0. */

export function useFoldChroma<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const fold = ref.current;
    if (!fold) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let node: HTMLElement | null = fold.parentElement;
    let scroller: HTMLElement | null = null;
    while (node) {
      const y = getComputedStyle(node).overflowY;
      if (y === "auto" || y === "scroll") {
        scroller = node;
        break;
      }
      node = node.parentElement;
    }
    if (!scroller) return;

    const paint = () => {
      const h = fold.offsetHeight;
      if (h === 0) {
        fold.style.setProperty("--ca", "0");
        return;
      }
      const t = scroller.scrollTop / h;
      if (t <= 0 || t >= 1) {
        fold.style.setProperty("--ca", "0");
        fold.removeAttribute("data-ca");
        return;
      }
      fold.style.setProperty("--ca", (Math.sin(t * Math.PI) * 6.4).toFixed(2));
      fold.setAttribute("data-ca", "");
    };

    paint();
    scroller.addEventListener("scroll", paint, { passive: true });
    return () => scroller.removeEventListener("scroll", paint);
  }, []);

  return ref;
}
