import { i as __toESM } from "../_runtime.mjs";
import { B as require_react, _ as Navigate, b as require_jsx_runtime, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Route } from "./router-G7fHBEkz.mjs";
import { a as pack, n as Stage, o as useLedger, r as cn, t as Button } from "./stage-BtgzdvFJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/q._step-J2MxWiTb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function connection() {
	if (typeof navigator === "undefined") return void 0;
	return navigator.connection;
}
/**
* QR 영상 로드 — 작은 지정 파일이 먼저, 1080은 나중.
*
* 1. poster  (jpg ~20KB)  화면을 당장 그린다. 실패하면 안 됨.
* 2. video   (mp4 ~100KB) 그 선택지에 지정된 압축 루프. 이것도 실패하면 안 됨.
*    HLS/DASH 쓰지 말 것. 3초 영상에 플레이리스트 왕복이 더 길다.
*    소리 없음, moov 앞쪽, H.264 baseline. LINE·3G에서도 이 파일을 재생.
* 3. videoHi (1080 mp4)   나중에 서버에 올리는 고화질.
*    4G이고 Save-Data가 아닐 때만, 작은 영상이 이미 나온 뒤에 받아 교체.
*    안 오면 그냥 압축본을 계속 본다. 고화질은 보너스.
*
* 2G / Save-Data / 모션 축소 → 1만. 지정 영상은 포스터로라도 도착한다.
*/
function readMediaGate() {
	if (typeof window === "undefined") return {
		reducedMotion: true,
		saveData: false,
		richMedia: false
	};
	const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const conn = connection();
	const saveData = Boolean(conn?.saveData);
	const verySlow = conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g";
	return {
		reducedMotion,
		saveData,
		richMedia: !reducedMotion && !saveData && !verySlow
	};
}
/** 1080은 빠른 망에서만. 지정 압축본을 기다리지 않게. */
function canUpgradeToHi() {
	const conn = connection();
	return Boolean(conn && conn.effectiveType === "4g" && !conn.saveData);
}
/**
* 작은 지정 영상이 재생된 뒤에만 1080을 받아 갈아끼운다.
* videoHi가 없으면 아무 것도 안 한다.
*/
function swapToHiWhenReady(el, videoHi) {
	if (!videoHi || !canUpgradeToHi()) return;
	const probe = document.createElement("video");
	probe.muted = true;
	probe.preload = "auto";
	probe.src = videoHi;
	probe.addEventListener("canplaythrough", () => {
		const t = el.currentTime;
		el.src = videoHi;
		el.currentTime = t;
		el.play().catch(() => void 0);
	}, { once: true });
}
/** 지금 장 + 앞뒤만 받는다. 다섯 장을 한꺼번에 받지 않음. */
function neighborIds(ids, selected) {
	if (ids.length === 0) return /* @__PURE__ */ new Set();
	const i = Math.max(0, ids.findIndex((id) => id === selected));
	const n = ids.length;
	const near = /* @__PURE__ */ new Set();
	for (const d of [
		-1,
		0,
		1
	]) {
		const id = ids[(i + d + n) % n];
		if (id) near.add(id);
	}
	return near;
}
function OptionReel({ options, selected, onSelect, labelledBy }) {
	const scrollerRef = (0, import_react.useRef)(null);
	const videosRef = (0, import_react.useRef)([]);
	const restored = (0, import_react.useRef)(false);
	const [rich, setRich] = (0, import_react.useState)(false);
	const loop = options.length > 1;
	const last = options[options.length - 1];
	const first = options[0];
	const slides = loop && last && first ? [
		{
			option: last,
			key: "before",
			clone: true
		},
		...options.map((option) => ({
			option,
			key: option.id,
			clone: false
		})),
		{
			option: first,
			key: "after",
			clone: true
		}
	] : options.map((option) => ({
		option,
		key: option.id,
		clone: false
	}));
	const hot = neighborIds(options.map((o) => o.id), selected);
	(0, import_react.useEffect)(() => {
		setRich(readMediaGate().richMedia);
	}, []);
	(0, import_react.useEffect)(() => {
		const root = scrollerRef.current;
		if (!root || restored.current) return;
		const id = selected ?? options[0]?.id;
		const index = options.findIndex((o) => o.id === id);
		if (index < 0) return;
		const slot = loop ? index + 1 : index;
		root.scrollTop = root.clientHeight * slot;
		restored.current = true;
	}, [
		loop,
		options,
		selected
	]);
	(0, import_react.useEffect)(() => {
		const root = scrollerRef.current;
		if (!root) return;
		const wrap = () => {
			if (!loop) return;
			const h = root.clientHeight;
			if (h === 0) return;
			const i = root.scrollTop / h;
			const n = options.length;
			if (i < .02) root.scrollTop = h * n;
			else if (i > n + .98) root.scrollTop = h;
		};
		const io = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				const el = entry.target;
				const id = el.dataset.optionId;
				const idx = Number(el.dataset.slide);
				const video = videosRef.current[idx];
				if (entry.isIntersecting && entry.intersectionRatio >= .55) {
					if (id) onSelect(id);
					if (video && rich) {
						video.play().catch(() => void 0);
						swapToHiWhenReady(video, options.find((o) => o.id === id)?.videoHi);
					}
				} else if (video) video.pause();
			}
		}, {
			root,
			threshold: [.55]
		});
		for (const child of Array.from(root.children)) io.observe(child);
		root.addEventListener("scroll", wrap, { passive: true });
		root.addEventListener("scrollend", wrap);
		return () => {
			io.disconnect();
			root.removeEventListener("scroll", wrap);
			root.removeEventListener("scrollend", wrap);
		};
	}, [
		loop,
		onSelect,
		options.length,
		rich
	]);
	function go(delta) {
		const root = scrollerRef.current;
		if (!root) return;
		const h = root.clientHeight;
		const next = Math.round(root.scrollTop / h) + delta;
		const child = root.children[next];
		if (child) {
			child.scrollIntoView({
				block: "start",
				behavior: "smooth"
			});
			return;
		}
		if (!loop || slides.length === 0) return;
		const wrapTo = delta > 0 ? 1 : slides.length - 2;
		root.children[wrapTo]?.scrollIntoView({
			block: "start",
			behavior: "instant"
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-0 bg-ink",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: scrollerRef,
			role: "radiogroup",
			"aria-labelledby": labelledBy,
			tabIndex: 0,
			onKeyDown: (e) => {
				if (e.key === "ArrowDown" || e.key === "ArrowRight") {
					e.preventDefault();
					go(1);
				}
				if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
					e.preventDefault();
					go(-1);
				}
			},
			className: "reel-scroller flex h-full snap-y snap-mandatory flex-col overflow-y-auto overscroll-y-contain",
			children: slides.map((slide, i) => {
				const active = !slide.clone && selected === slide.option.id;
				const ready = hot.has(slide.option.id);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					"data-option-id": slide.option.id,
					"data-slide": i,
					role: slide.clone ? void 0 : "radio",
					"aria-hidden": slide.clone || void 0,
					"aria-checked": slide.clone ? void 0 : active,
					"aria-label": slide.clone ? void 0 : slide.option.label,
					className: "relative h-full w-full shrink-0 basis-full snap-start snap-always bg-ink",
					children: [ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: slide.option.poster,
						alt: "",
						draggable: false,
						fetchPriority: active ? "high" : "low",
						className: "absolute inset-0 h-full w-full object-cover"
					}) : null, rich && ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
						ref: (node) => {
							videosRef.current[i] = node;
						},
						className: "absolute inset-0 h-full w-full object-cover",
						poster: slide.option.poster,
						src: slide.option.video,
						muted: true,
						loop: true,
						playsInline: true,
						preload: active ? "auto" : "metadata"
					}) : null]
				}, slide.key);
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "pointer-events-none absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-1.5",
			"aria-hidden": "true",
			children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { className: cn("h-1.5 w-1.5 rounded-full transition-opacity duration-[var(--motion-quick)] ease-[var(--ease-out)]", selected === option.id ? "bg-paper opacity-100" : "bg-paper opacity-35") }, option.id))
		})]
	});
}
function QuestionScreen({ question, phases, index, selected, onSelect, onConfirm }) {
	const headingId = `q-${question.id}`;
	const current = question.options.find((o) => o.id === selected);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "relative h-dvh",
		onSubmit: (e) => {
			e.preventDefault();
			if (selected) onConfirm();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OptionReel, {
				options: question.options,
				selected,
				onSelect,
				labelledBy: headingId
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "pointer-events-none absolute inset-x-0 top-0 z-20 scrim-top px-screen pt-screen pb-24",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					"aria-label": "今夜の流れ",
					className: "flex items-center justify-between",
					children: phases.map((phase, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("font-sans text-meta tracking-phase stagger-in", i === index ? "text-paper" : "text-paper/45"),
						children: phase
					}, phase))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					id: headingId,
					className: "mt-4 font-sans text-question font-medium leading-snug tracking-tight text-paper text-balance stagger-in whitespace-pre-line",
					children: question.prompt
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute inset-x-0 bottom-0 z-20 scrim-bottom px-screen pb-screen pt-24",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-5 font-sans text-option tracking-wide text-paper",
					children: current?.label ?? ""
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					variant: "frost",
					className: "pointer-events-auto",
					disabled: !selected,
					children: question.confirm
				})]
			})
		]
	});
}
function QuestionPage() {
	const navigate = useNavigate();
	const { step: stepParam } = Route.useParams();
	const step = Number.parseInt(stepParam, 10);
	const hydrate = useLedger((s) => s.hydrate);
	const hydrated = useLedger((s) => s.hydrated);
	const id = useLedger((s) => s.id);
	const answers = useLedger((s) => s.answers);
	const choose = useLedger((s) => s.choose);
	(0, import_react.useEffect)(() => {
		hydrate();
	}, [hydrate]);
	if (!Number.isFinite(step) || step < 1) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
		to: "/q/$step",
		params: { step: "1" }
	});
	if (step > pack.questions.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/r" });
	const question = pack.questions[step - 1];
	if (!question) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	if (hydrated && !id) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	const selected = answers[question.id] ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stage, {
		tone: "reel",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuestionScreen, {
			question,
			phases: pack.phases,
			index: step - 1,
			selected,
			onSelect: (optionId) => choose(question.id, optionId),
			onConfirm: () => {
				if (!selected) return;
				if (step >= pack.questions.length) {
					navigate({ to: "/r" });
					return;
				}
				navigate({
					to: "/q/$step",
					params: { step: String(step + 1) }
				});
			}
		}, question.id)
	});
}
//#endregion
export { QuestionPage as component };
