import type { ExperiencePack, Option } from "@/shared/types";
import { beers } from "@/beers/beers";
import { LEX } from "@/recommend/lexicon";

function clip(id: keyof typeof LEX, label: string): Option {
  const lex = LEX[id];
  // 질문별 폴더. q1 향 / q2 맛 / q3 입안.
  const folder = { aroma: "q1", taste: "q2", body: "q3" }[lex.layer];
  return {
    id,
    label,
    layer: lex.layer,
    prior: lex.prior,
    keys: lex.keys,
    poster: `/videos/${folder}/${id}.jpg?v=39`,
    video: `/videos/${folder}/${id}.mp4?v=39`,
    videoHevc: `/videos/${folder}/${id}.hevc.mp4?v=39`,
  };
}

/**
 * 질문 3개 + 선택지. 향·맛·입안이라는 말은 화면에 안 낸다.
 * 사람은 일본어 형용사만 고른다. 분위기는 지정 영상.
 */
export const tonight: ExperiencePack = {
  id: "tonight",
  phases: ["はじまり", "さかり", "なごり"],
  intro: {
    lines: [
      { text: "How many" },
      { text: "drinks", emphasis: true },
      { text: "are too many" },
      { text: "drinks?" },
    ],
    start: "スタート",
  },
  questions: [
    {
      id: "aroma",
      phase: "はじまり",
      prompt: "心の向くまま歩くなら、\nどんな道？",
      confirm: "今夜は、これで。",
      options: [
        clip("aroma_fruity", "フルーティーな"),
        clip("aroma_hoppy", "ホップの"),
        clip("aroma_fresh", "爽やかな"),
        clip("aroma_malty", "モルトの"),
        clip("aroma_floral", "華やかな"),
      ],
    },
    {
      id: "taste",
      phase: "さかり",
      prompt: "ひと休みするなら、\nどんな一杯？",
      confirm: "一口は、これで。",
      options: [clip("taste_sweet", "ほのかな甘み"), clip("taste_bitter", "ほろ苦い")],
    },
    {
      id: "body",
      phase: "なごり",
      prompt: "帰り道、\nどんな音楽に包まれたい？",
      confirm: "帰り道は、これで。",
      options: [
        clip("body_smooth", "なめらかな"),
        clip("body_soft", "柔らかな"),
        clip("body_gentle", "優しい"),
        clip("body_thin", "爽やかな"),
        clip("body_full", "まろやかな"),
      ],
    },
  ],
  items: beers,
};
