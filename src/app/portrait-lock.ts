/** 스마트폰만 세로 고정. 해상도는 그대로. 데스크톱·미리보기는 안 돌린다. */
export function bindPortraitLock() {
  const apply = () => {
    const phone = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    const landscape = window.innerWidth > window.innerHeight;
    const lock = phone && landscape;
    document.documentElement.classList.toggle("lock-portrait", lock);
    if (lock) {
      document.documentElement.style.setProperty("--vvh", `${window.innerWidth}px`);
    }
    const orient = window.screen?.orientation as ScreenOrientation & {
      lock?: (mode: string) => Promise<void>;
    };
    if (phone && orient?.lock) void orient.lock("portrait").catch(() => undefined);
  };

  apply();
  window.addEventListener("resize", apply);
  window.addEventListener("orientationchange", apply);
  return () => {
    window.removeEventListener("resize", apply);
    window.removeEventListener("orientationchange", apply);
    document.documentElement.classList.remove("lock-portrait");
  };
}
