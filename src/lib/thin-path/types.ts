export type Axis = string;

export type Layer = "aroma" | "taste" | "body";

export type KeyStat = {
  term: string;
  count: number;
};

export type Option = {
  id: string;
  label: string;
  layer: Layer;
  /** 論文の総出現数. レールの上からこの順. まろやかは説明文で数えるので 0. */
  prior: number;
  keys: KeyStat[];
  poster: string;
  /** 지정 영상. 1080 H.264. */
  video: string;
  /** iOS HEVC 1080. canPlayType probably일 때만. */
  videoHevc?: string;
  /** AV1 1080. Chrome·새 Safari. */
  videoAv1?: string;
  /** 나중에 더 높은 단. 없어도 동작. */
  videoHi?: string;
};

export type Question = {
  id: string;
  phase: string;
  prompt: string;
  confirm: string;
  options: Option[];
};

export type Item = {
  id: string;
  name: string;
  style: string;
  abv: string;
  maker: string;
  place: string;
  line: string;
  /** 공식 설명. 매칭은 여기의 논문 단어를 센다. 없으면 line. */
  copy?: string;
  /** 양조장이 쓴 설명. 고치지 않고 그대로 둔다. copy의 원문. */
  source?: {
    kind?: string;
    ingredients?: string;
    shelf?: string;
    text: string;
  };
  bottle: "tall" | "stout" | "wide";
  /** 누끼 병. 없으면 공통 병. */
  art?: string;
  /** 会場ブース. 地図のセル id. */
  booth: string;
  /** 소장용 포스터. 그림은 템플릿+필드. 추천 때 그리지 않음. */
  poster: {
    filename: string;
  };
};

export type ExperiencePack = {
  id: string;
  phases: string[];
  intro: {
    lines: { text: string; emphasis?: boolean }[];
    start: string;
  };
  questions: Question[];
  items: Item[];
};

export type AnswerMap = Record<string, string>;

export type LedgerEvent = {
  questionId: string;
  optionId: string;
  at: number;
};

export type RankedItem = {
  item: Item;
  score: number;
};

export type CompareResult = {
  winner: RankedItem;
  ranked: RankedItem[];
  signature: string;
};
