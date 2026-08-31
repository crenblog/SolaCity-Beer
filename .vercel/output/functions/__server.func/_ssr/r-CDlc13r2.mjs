import { i as __toESM } from "../_runtime.mjs";
import { B as require_react, _ as Navigate, b as require_jsx_runtime, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as pack, i as extractTerms, n as Stage, o as useLedger, r as cn, t as Button } from "./stage-BtgzdvFJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/r-CDlc13r2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function toVec(bag, axes) {
	return axes.map((axis) => bag[axis] ?? 0);
}
function l1(bag) {
	const sum = Object.values(bag).reduce((n, v) => n + v, 0);
	if (sum === 0) return bag;
	const out = {};
	for (const [k, v] of Object.entries(bag)) out[k] = v / sum;
	return out;
}
function bagOf(keys) {
	const bag = {};
	for (const { term, count } of keys) bag[term] = (bag[term] ?? 0) + count;
	return bag;
}
function dot(a, b) {
	return a.reduce((sum, n, i) => sum + n * (b[i] ?? 0), 0);
}
function norm(a) {
	return Math.sqrt(a.reduce((sum, n) => sum + n * n, 0));
}
function cosine(a, b) {
	const d = norm(a) * norm(b);
	if (d === 0) return 0;
	return dot(a, b) / d;
}
function answerSignature(answers) {
	return Object.keys(answers).sort().map((key) => `${key}:${answers[key]}`).join("|");
}
function layerScore(keys, beerTerms) {
	const allowed = new Set(keys.map((k) => k.term));
	const beerLayer = {};
	for (const [term, n] of Object.entries(beerTerms)) if (allowed.has(term)) beerLayer[term] = n;
	const vocab = [...allowed];
	return cosine(toVec(l1(bagOf(keys)), vocab), toVec(l1(beerLayer), vocab));
}
function scoreItem(pack, item, answers) {
	const text = item.copy ?? item.line;
	const beerTerms = extractTerms(text);
	const parts = [];
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
/** Deterministic rank. Numbers never wait on a model. */
function compare(pack, answers) {
	if (pack.questions.every((q) => !answers[q.id])) return null;
	const ranked = pack.items.map((item) => ({
		item,
		score: scoreItem(pack, item, answers)
	})).sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id));
	const winner = ranked[0];
	if (!winner) return null;
	return {
		winner,
		ranked,
		signature: answerSignature(answers)
	};
}
function isComplete(pack, answers) {
	return pack.questions.every((q) => Boolean(answers[q.id]));
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var narrateMatch = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("d1c6d03b77ee5b3bacd834c22570e5cf35c63a8348fc4c26d28f3dd3243d4c8a"));
function Bottle({ item, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: "/bottle.jpg",
		alt: item.name,
		width: 289,
		height: 980,
		className: cn("h-bottle w-auto origin-bottom object-contain mix-blend-multiply", className)
	});
}
function ResultScreen({ result, narration, onAgain }) {
	const { item } = result.winner;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col px-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "pt-screen flex items-baseline justify-between font-sans text-meta tracking-[0.18em] text-ink-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.style }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "tabular-nums",
					children: item.abv
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-6 font-display text-product font-medium leading-none tracking-display text-ink text-balance stagger-in",
				children: item.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-1 flex-col items-center justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bottle, {
					item,
					className: "h-bottle w-auto stagger-in"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-center font-sans text-sm leading-relaxed text-ink-muted text-pretty stagger-in",
				children: item.line
			}),
			narration ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-center font-sans text-sm leading-relaxed text-ink/80 text-pretty",
				children: narration
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "pb-screen mt-8 flex flex-col items-center gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-sans text-meta tracking-[0.22em] text-ink-muted",
					children: item.place
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: onAgain,
					children: "もう一度"
				})]
			})
		]
	});
}
function ResultPage() {
	const navigate = useNavigate();
	const hydrate = useLedger((s) => s.hydrate);
	const hydrated = useLedger((s) => s.hydrated);
	const answers = useLedger((s) => s.answers);
	const narration = useLedger((s) => s.narration);
	const narrationFor = useLedger((s) => s.narrationFor);
	const setNarration = useLedger((s) => s.setNarration);
	const reset = useLedger((s) => s.reset);
	const asked = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		hydrate();
	}, [hydrate]);
	const result = hydrated && isComplete(pack, answers) ? compare(pack, answers) : null;
	(0, import_react.useEffect)(() => {
		if (!result) return;
		if (narrationFor === result.signature) return;
		if (asked.current === result.signature) return;
		asked.current = result.signature;
		const choices = pack.questions.map((q) => {
			const option = q.options.find((o) => o.id === answers[q.id]);
			return {
				prompt: q.prompt.replace(/\n/g, " "),
				answer: option?.label ?? ""
			};
		});
		narrateMatch({ data: {
			beerName: result.winner.item.name,
			beerLine: result.winner.item.line,
			choices
		} }).then((res) => {
			if (res.ok) setNarration(result.signature, res.text);
		});
	}, [
		result,
		answers,
		narrationFor,
		setNarration
	]);
	if (hydrated && !result) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stage, {
		tone: "result",
		children: result ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultScreen, {
			result,
			narration: narrationFor === result.signature ? narration : null,
			onAgain: () => {
				reset();
				navigate({ to: "/" });
			}
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-dvh bg-result" })
	});
}
//#endregion
export { ResultPage as component };
