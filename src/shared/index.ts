export type {
  AnswerMap,
  Axis,
  CompareResult,
  ExperiencePack,
  Item,
  KeyStat,
  Layer,
  Option,
  Question,
  RankedItem,
} from "@/shared/types";
export { compare, catalog, firstIncompleteStep, isComplete, answerSignature } from "@/recommend/compare";
export {
  readMediaGate,
  neighborIds,
  canUpgradeToHi,
  swapToHiWhenReady,
  prefetchQuestion,
  prefetchNeighbors,
  prefetchPosters,
  warmupPath,
  cacheVideo,
  waitImage,
  avifOf,
  warmupHero,
  warmupLoadType,
  pickVideo,
  waitVideoReady,
  mediaSrc,
  subscribeMedia,
} from "@/shared/gate";
export { pack, useLedger } from "@/shared/session";
export { withStepTransition, dissolveToReel } from "@/shared/step-transition";
export { applyThemeColor, applyInkChrome, samplePosterChrome, sampleVideoChrome } from "@/shared/chrome";
