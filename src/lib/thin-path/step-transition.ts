export type StepDir = "forward" | "back";

/** 장면이 서로 녹는다. 밀지 않는다. 호흡 한 번. */
const HOLD_MS = 480;
const ENTER_MS = 720;

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

type TransitionDoc = Document & {
  startViewTransition?: (update: () => void | Promise<void>) => {
    finished: Promise<void>;
  };
};

async function runTransition(
  run: () => Promise<unknown> | void,
  hold: number,
) {
  if (typeof document === "undefined") {
    await run();
    return;
  }

  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    delete root.dataset.stepDir;
    await run();
    return;
  }

  const doc = document as TransitionDoc;
  if (typeof doc.startViewTransition === "function") {
    try {
      const vt = doc.startViewTransition(async () => {
        await run();
      });
      await vt.finished.catch(() => undefined);
      return;
    } catch {
      /* 뷰 전환이 없으면 아래 페이드 */
    }
  }

  root.dataset.stepDir = "out";
  await wait(Math.round(hold * 0.58));
  await run();
  root.dataset.stepDir = "in";
  window.setTimeout(() => {
    if (root.dataset.stepDir === "in") delete root.dataset.stepDir;
  }, hold);
}

export async function withStepTransition(_dir: StepDir, run: () => Promise<unknown> | void) {
  await runTransition(run, HOLD_MS);
}

/** 로딩이 영상에 녹는다. 같은 이징, 한 호흡 더. */
export async function dissolveToReel(run: () => Promise<unknown> | void) {
  if (typeof document === "undefined") {
    await run();
    return;
  }
  const root = document.documentElement;
  root.dataset.enterReel = "1";
  try {
    await runTransition(run, ENTER_MS);
  } finally {
    delete root.dataset.enterReel;
  }
}
