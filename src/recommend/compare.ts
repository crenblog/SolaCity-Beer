import { extractTerms } from "@/recommend/lexicon";
import type {
  AnswerMap,
  CompareResult,
  ExperiencePack,
  Item,
  KeyStat,
  RankedItem,
} from "@/shared/types";

function toVec(bag: Record<string, number>, axes: string[]): number[] {
  return axes.map((axis) => bag[axis] ?? 0);
}

function l1(bag: Record<string, number>): Record<string, number> {
  const sum = Object.values(bag).reduce((n, v) => n + v, 0);
  if (sum === 0) return bag;
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(bag)) out[k] = v / sum;
  return out;
}

function bagOf(keys: KeyStat[]): Record<string, number> {
  const bag: Record<string, number> = {};
  for (const { term, count } of keys) bag[term] = (bag[term] ?? 0) + count;
  return bag;
}

function dot(a: number[], b: number[]): number {
  return a.reduce((sum, n, i) => sum + n * (b[i] ?? 0), 0);
}

function norm(a: number[]): number {
  return Math.sqrt(a.reduce((sum, n) => sum + n * n, 0));
}

function cosine(a: number[], b: number[]): number {
  const d = norm(a) * norm(b);
  if (d === 0) return 0;
  return dot(a, b) / d;
}

export function answerSignature(answers: AnswerMap): string {
  return Object.keys(answers)
    .sort()
    .map((key) => `${key}:${answers[key]}`)
    .join("|");
}

function layerScore(keys: KeyStat[], beerTerms: Record<string, number>): number {
  // 향 단어가 훨씬 많다. 층마다 따로 겹친 뒤 평균내서 입안이 안 먹히게.
  const allowed = new Set(keys.map((k) => k.term));
  const beerLayer: Record<string, number> = {};
  for (const [term, n] of Object.entries(beerTerms)) {
    if (allowed.has(term)) beerLayer[term] = n;
  }
  const vocab = [...allowed];
  return cosine(toVec(l1(bagOf(keys)), vocab), toVec(l1(beerLayer), vocab));
}

function scoreItem(pack: ExperiencePack, item: Item, answers: AnswerMap): number {
  const text = item.copy ?? item.line;
  const beerTerms = extractTerms(text);
  const parts: number[] = [];
  for (const question of pack.questions) {
    const optionId = answers[question.id];
    if (!optionId) continue;
    const option = question.options.find((o) => o.id === optionId);
    if (!option) continue;
    parts.push(layerScore(option.keys, beerTerms));
  }
  if (parts.length === 0) return 0;
  return parts.reduce((a, b) => a + b, 0) / parts.length;
}

/** 원문이 있는 잔만. 가짜는 빼 둔다. */
export function catalog(pack: ExperiencePack): Item[] {
  const real = pack.items.filter((item) => item.source);
  return real.length > 0 ? real : pack.items;
}

/** 숫자만으로 순위. 추천 순간에 모델을 기다리지 않는다. */
export function compare(pack: ExperiencePack, answers: AnswerMap): CompareResult | null {
  if (pack.questions.every((q) => !answers[q.id])) return null;

  const ranked: RankedItem[] = catalog(pack)
    .map((item) => ({ item, score: scoreItem(pack, item, answers) }))
    .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id));

  const winner = ranked[0];
  if (!winner) return null;

  return {
    winner,
    ranked,
    signature: answerSignature(answers),
  };
}

export function isComplete(pack: ExperiencePack, answers: AnswerMap): boolean {
  return pack.questions.every((q) => Boolean(answers[q.id]));
}

export function firstIncompleteStep(pack: ExperiencePack, answers: AnswerMap): number {
  const index = pack.questions.findIndex((q) => !answers[q.id]);
  return index === -1 ? pack.questions.length + 1 : index + 1;
}
