import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stage-BtgzdvFJ.js
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center font-sans font-medium transition-[opacity,transform,background-color,color] duration-[var(--motion-quick)] ease-[var(--ease-out)] disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink", {
	variants: { variant: {
		text: "bg-transparent text-ink text-base tracking-wide disabled:opacity-40 active:not-disabled:scale-[0.96]",
		pill: "h-14 w-full rounded-full bg-surface text-ink text-sm tracking-wide disabled:text-ink-subtle active:not-disabled:scale-[0.98]",
		frost: "h-14 w-full rounded-full bg-paper text-ink text-sm tracking-wide disabled:bg-paper/45 disabled:text-ink/50 active:not-disabled:scale-[0.98] focus-visible:outline-paper",
		ghost: "bg-transparent text-ink-muted text-xs tracking-[0.18em] uppercase disabled:opacity-40 active:not-disabled:opacity-70"
	} },
	defaultVariants: { variant: "pill" }
});
function Button({ className, variant, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: cn(buttonVariants({ variant }), className),
		...props
	});
}
function keys(...pairs) {
	return pairs.filter(([, count]) => count > 0).map(([term, count]) => ({
		term,
		count
	}));
}
/** 長い表記から先に数える. */
var ALIASES = [
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
	["感じる", "感じる"]
].sort((a, b) => b[0].length - a[0].length);
function extractTerms(text) {
	const bag = {};
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
var LEX = {
	aroma_hoppy: {
		layer: "aroma",
		prior: 1277,
		keys: keys(["ホップ", 1277], ["香り", 453], ["苦味", 396], ["アロマ", 137], ["フレーバー", 95], ["風味", 67], ["味わい", 59], ["甘み", 28], ["コク", 9], ["ロースト", 4], ["渋み", 3])
	},
	aroma_fruity: {
		layer: "aroma",
		prior: 676,
		keys: keys(["フルーティー", 676], ["香り", 286], ["アロマ", 133], ["味わい", 80], ["風味", 39], ["フレーバー", 29], ["エステル", 28], ["酸味", 27], ["苦味", 21], ["甘み", 16])
	},
	aroma_fresh: {
		layer: "aroma",
		prior: 652,
		keys: keys(["爽やか", 652], ["香り", 204], ["酸味", 156], ["アロマ", 49], ["苦味", 72], ["味わい", 44], ["風味", 38], ["フレーバー", 35], ["甘み", 20])
	},
	aroma_malty: {
		layer: "aroma",
		prior: 616,
		keys: keys(["モルト", 616], ["風味", 111], ["味わい", 111], ["甘み", 121], ["香り", 74], ["コク", 48], ["フレーバー", 30], ["旨味", 48], ["苦味", 35], ["アロマ", 15], ["酸味", 9], ["ロースト", 7])
	},
	aroma_floral: {
		layer: "aroma",
		prior: 401,
		keys: keys(["華やか", 401], ["香り", 220], ["アロマ", 74], ["風味", 37], ["味わい", 27], ["フレーバー", 9], ["エステル", 8], ["苦味", 10], ["酸味", 5])
	},
	taste_sweet: {
		layer: "taste",
		prior: 121,
		keys: keys(["甘み", 121], ["コク", 48], ["旨味", 48])
	},
	taste_bitter: {
		layer: "taste",
		prior: 396,
		keys: keys(["苦味", 396])
	},
	body_smooth: {
		layer: "body",
		prior: 83,
		keys: keys(["なめらか", 83], ["口当たり", 59], ["舌触り", 13], ["マウスフィール", 9])
	},
	body_soft: {
		layer: "body",
		prior: 67,
		keys: keys(["柔らか", 67], ["口当たり", 53], ["マウスフィール", 8], ["舌触り", 2])
	},
	body_gentle: {
		layer: "body",
		prior: 35,
		keys: keys(["優しい", 35], ["口当たり", 27], ["のどごし", 1], ["舌触り", 2])
	},
	body_thin: {
		layer: "body",
		prior: 29,
		keys: keys(["爽やか", 29], ["口当たり", 21], ["のどごし", 2])
	},
	body_full: {
		layer: "body",
		prior: 0,
		keys: keys(["まろやか", 1])
	}
};
function clip(id, label) {
	const lex = LEX[id];
	return {
		id,
		label,
		layer: lex.layer,
		prior: lex.prior,
		keys: lex.keys,
		poster: `/media/${id}.jpg`,
		video: `/media/${id}.mp4`
	};
}
/**
* Labels are what the person sees. Ids are the tasting axis.
* Do not surface 香り / 味 / 口当たり in the UI.
* Option order = 論文 prior desc. まろやかな is counted in copy, last.
*/
var tonight = {
	id: "tonight",
	phases: [
		"はじまり",
		"さかり",
		"なごり"
	],
	intro: {
		lines: [
			{ text: "How many" },
			{
				text: "drinks",
				emphasis: true
			},
			{ text: "are too many" },
			{ text: "drinks?" }
		],
		start: "スタート"
	},
	questions: [
		{
			id: "aroma",
			phase: "はじまり",
			prompt: "今夜、最初に\n来るのは？",
			confirm: "今夜は、これで。",
			options: [
				clip("aroma_hoppy", "ホップの"),
				clip("aroma_fruity", "フルーティーな"),
				clip("aroma_fresh", "爽やかな"),
				clip("aroma_malty", "モルトの"),
				clip("aroma_floral", "華やかな")
			]
		},
		{
			id: "taste",
			phase: "さかり",
			prompt: "ひと口目に、\n何を感じたい？",
			confirm: "一口は、これで。",
			options: [clip("taste_sweet", "ほのかな甘み"), clip("taste_bitter", "ほろ苦い")]
		},
		{
			id: "body",
			phase: "なごり",
			prompt: "帰り道、\nどんな感じでいたい？",
			confirm: "帰り道は、これで。",
			options: [
				clip("body_smooth", "なめらかな"),
				clip("body_soft", "柔らかな"),
				clip("body_gentle", "優しい"),
				clip("body_thin", "爽やかな"),
				clip("body_full", "まろやかな")
			]
		}
	],
	items: [
		{
			id: "tenjin-ipa",
			name: "天神 IPA",
			style: "IPA",
			abv: "6.6%",
			maker: "DAZAIFU BREWERY",
			place: "KAMEIDO",
			line: "トロピカルな香り、キレのある苦み。",
			copy: "ホップの香り。トロピカルなアロマとキレのある苦み。爽やかな口当たり。",
			bottle: "tall"
		},
		{
			id: "kagaribi-lager",
			name: "篝火ラガー",
			style: "LAGER",
			abv: "5.2%",
			maker: "KAGARIBI",
			place: "YANAKA",
			line: "麦の甘みと、火のそばの静けさ。",
			copy: "モルトの風味と甘み。柔らかな口当たり。",
			bottle: "stout"
		},
		{
			id: "hanakage-white",
			name: "花影ホワイト",
			style: "WIT",
			abv: "4.8%",
			maker: "KOENJI ALE",
			place: "KOENJI",
			line: "白い泡、花のような香り。",
			copy: "華やかな香り。花のようなアロマ、優しい口当たり。",
			bottle: "wide"
		},
		{
			id: "kaju-sour",
			name: "果樹サワー",
			style: "SOUR",
			abv: "4.4%",
			maker: "SETAGAWA",
			place: "SHIMOKITAZAWA",
			line: "果皮の酸味と、短い会話。",
			copy: "フルーティーな香り。果皮の酸味。",
			bottle: "wide"
		},
		{
			id: "shioji-pils",
			name: "潮路ピルス",
			style: "PILS",
			abv: "5.0%",
			maker: "UMINARI",
			place: "ENOSHIMA",
			line: "乾いた苦み。海のあとの水のように。",
			copy: "ホップの香り。乾いた苦み。爽やかな口当たり。",
			bottle: "tall"
		},
		{
			id: "yoin-stout",
			name: "余韻スタウト",
			style: "STOUT",
			abv: "6.1%",
			maker: "KURAMA",
			place: "KAGURAZAKA",
			line: "ローストの余韻が、最後まで残る。",
			copy: "モルトの風味。ローストとまろやかな口当たり。なめらかな舌触り。",
			bottle: "stout"
		}
	]
};
var STORAGE_KEY = "thin-path.ledger.v1";
var empty = {
	id: null,
	answers: {},
	narration: null,
	narrationFor: null
};
function readSnapshot() {
	if (typeof window === "undefined") return empty;
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		if (!raw) return empty;
		const parsed = JSON.parse(raw);
		return {
			id: parsed.id ?? null,
			answers: parsed.answers ?? {},
			narration: parsed.narration ?? null,
			narrationFor: parsed.narrationFor ?? null
		};
	} catch {
		return empty;
	}
}
function writeSnapshot(snap) {
	if (typeof window === "undefined") return;
	try {
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
	} catch {}
}
function newId() {
	if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID().replace(/-/g, "").slice(0, 10);
	return Math.random().toString(36).slice(2, 12);
}
var pack = tonight;
var useLedger = create((set, get) => ({
	...empty,
	hydrated: false,
	hydrate: () => {
		if (get().hydrated) return;
		set({
			...readSnapshot(),
			hydrated: true
		});
	},
	start: () => {
		const id = newId();
		const next = {
			id,
			answers: {},
			narration: null,
			narrationFor: null
		};
		writeSnapshot(next);
		set({
			...next,
			hydrated: true
		});
		return id;
	},
	choose: (questionId, optionId) => {
		const questionIndex = pack.questions.findIndex((q) => q.id === questionId);
		const answers = {
			...get().answers,
			[questionId]: optionId
		};
		if (questionIndex >= 0) for (let i = questionIndex + 1; i < pack.questions.length; i++) {
			const later = pack.questions[i];
			if (later) delete answers[later.id];
		}
		const next = {
			id: get().id,
			answers,
			narration: null,
			narrationFor: null
		};
		writeSnapshot(next);
		set(next);
	},
	setNarration: (signature, text) => {
		writeSnapshot({
			id: get().id,
			answers: get().answers,
			narration: text,
			narrationFor: signature
		});
		set({
			narration: text,
			narrationFor: signature
		});
	},
	reset: () => {
		writeSnapshot(empty);
		set({
			...empty,
			hydrated: true
		});
	}
}));
function Stage({ children, tone = "paper" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-dvh justify-center bg-letterbox",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("relative flex min-h-dvh w-full max-w-stage flex-col overflow-hidden text-ink", tone === "result" ? "bg-result" : tone === "reel" ? "bg-ink" : "bg-paper"),
			children
		})
	});
}
//#endregion
export { pack as a, extractTerms as i, Stage as n, useLedger as o, cn as r, Button as t };
