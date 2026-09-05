/**
 * 北島・酒井「商品説明文で表現されるクラフトビールの特徴」
 * 日本感性工学会論文誌 22(4)
 * https://www.jstage.jst.go.jp/article/kansei/22/4/22_184/_pdf
 *
 * count = 論文の出現数. prior でレール順. パーセントは比較時に割る.
 * 滑らかな + なめらかな は一つ. まろやかな は説明文で数える.
 */
import type { KeyStat, Layer } from "@/shared/types";

export type Lex = {
  layer: Layer;
  prior: number;
  keys: KeyStat[];
};

function keys(...pairs: [string, number][]): KeyStat[] {
  return pairs.filter(([, count]) => count > 0).map(([term, count]) => ({ term, count }));
}

/** 長い表記から先に数える. */
export const ALIASES: [string, string][] = (
  [
    ["フルーティー", "フルーティー"],
    ["マウスフィール", "マウスフィール"],
    ["フレーバー", "フレーバー"],
    ["フィニッシュ", "フィニッシュ"],
    ["スパイシー", "スパイシー"],
    ["なめらか", "なめらか"],
    ["滑らか", "なめらか"],
    ["まろやか", "まろやか"],
    ["ホップ", "ホップ"],
    ["モルト", "モルト"],
    ["華やか", "華やか"],
    ["爽やか", "爽やか"],
    ["柔らか", "柔らか"],
    ["優しい", "優しい"],
    ["口当たり", "口当たり"],
    ["舌触り", "舌触り"],
    ["のどごし", "のどごし"],
    ["ロースト", "ロースト"],
    ["エステル", "エステル"],
    ["アロマ", "アロマ"],
    ["味わい", "味わい"],
    ["後味", "後味"],
    ["風味", "風味"],
    ["香り", "香り"],
    ["香る", "香り"],
    ["苦味", "苦味"],
    ["苦み", "苦味"],
    ["苦く", "苦味"],
    ["甘味", "甘み"],
    ["甘い", "甘み"],
    ["甘み", "甘み"],
    ["旨味", "旨味"],
    ["旨み", "旨味"],
    ["うま味", "旨味"],
    ["うまみ", "旨味"],
    ["酸味", "酸味"],
    ["渋み", "渋み"],
    ["コク", "コク"],
    ["感じる", "感じる"],
  ] as [string, string][]
).sort((a, b) => b[0].length - a[0].length);

export function extractTerms(text: string): Record<string, number> {
  const bag: Record<string, number> = {};
  let rest = text;
  for (const [from, to] of ALIASES) {
    let n = 0;
    let next = rest;
    let i = next.indexOf(from);
    while (i >= 0) {
      n += 1;
      next = next.slice(0, i) + next.slice(i + from.length);
      i = next.indexOf(from);
    }
    rest = next;
    if (n) bag[to] = (bag[to] ?? 0) + n;
  }
  return bag;
}

export const LEX: Record<string, Lex> = {
  aroma_hoppy: {
    layer: "aroma",
    prior: 1277,
    keys: keys(
      ["ホップ", 1277],
      ["香り", 453],
      ["苦味", 396],
      ["アロマ", 137],
      ["フレーバー", 95],
      ["風味", 67],
      ["味わい", 59],
      ["甘み", 28],
      ["コク", 9],
      ["ロースト", 4],
      ["渋み", 3],
    ),
  },
  aroma_fruity: {
    layer: "aroma",
    prior: 676,
    keys: keys(
      ["フルーティー", 676],
      ["香り", 286],
      ["アロマ", 133],
      ["味わい", 80],
      ["風味", 39],
      ["フレーバー", 29],
      ["エステル", 28],
      ["酸味", 27],
      ["苦味", 21],
      ["甘み", 16],
    ),
  },
  aroma_fresh: {
    layer: "aroma",
    prior: 652,
    keys: keys(
      ["爽やか", 652],
      ["香り", 204],
      ["酸味", 156],
      ["アロマ", 49],
      ["苦味", 72],
      ["味わい", 44],
      ["風味", 38],
      ["フレーバー", 35],
      ["甘み", 20],
    ),
  },
  aroma_malty: {
    layer: "aroma",
    prior: 616,
    keys: keys(
      ["モルト", 616],
      ["風味", 111],
      ["味わい", 111],
      ["甘み", 121],
      ["香り", 74],
      ["コク", 48],
      ["フレーバー", 30],
      ["旨味", 48],
      ["苦味", 35],
      ["アロマ", 15],
      ["酸味", 9],
      ["ロースト", 7],
    ),
  },
  aroma_floral: {
    layer: "aroma",
    prior: 401,
    keys: keys(
      ["華やか", 401],
      ["香り", 220],
      ["アロマ", 74],
      ["風味", 37],
      ["味わい", 27],
      ["フレーバー", 9],
      ["エステル", 8],
      ["苦味", 10],
      ["酸味", 5],
    ),
  },
  taste_sweet: {
    layer: "taste",
    prior: 121,
    keys: keys(["甘み", 121], ["コク", 48], ["旨味", 48]),
  },
  taste_bitter: {
    layer: "taste",
    prior: 396,
    keys: keys(["苦味", 396]),
  },
  body_smooth: {
    layer: "body",
    prior: 83,
    keys: keys(
      ["なめらか", 83],
      ["口当たり", 59],
      ["舌触り", 13],
      ["マウスフィール", 9],
    ),
  },
  body_soft: {
    layer: "body",
    prior: 67,
    keys: keys(["柔らか", 67], ["口当たり", 53], ["マウスフィール", 8], ["舌触り", 2]),
  },
  body_gentle: {
    layer: "body",
    prior: 35,
    keys: keys(["優しい", 35], ["口当たり", 27], ["のどごし", 1], ["舌触り", 2]),
  },
  body_thin: {
    layer: "body",
    prior: 29,
    keys: keys(["爽やか", 29], ["口当たり", 21], ["のどごし", 2]),
  },
  body_full: {
    layer: "body",
    prior: 0,
    keys: keys(["まろやか", 1]),
  },
};
