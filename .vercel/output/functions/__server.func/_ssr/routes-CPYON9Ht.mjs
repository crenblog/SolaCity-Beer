import { i as __toESM } from "../_runtime.mjs";
import { B as require_react, b as require_jsx_runtime, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as pack, n as Stage, o as useLedger, r as cn, t as Button } from "./stage-BtgzdvFJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CPYON9Ht.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function IntroScreen({ onStart }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col px-screen",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-1 flex-col items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-center text-display font-medium leading-display tracking-display text-ink text-balance",
				children: pack.intro.lines.map((line, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("block stagger-in", line.emphasis && "italic"),
					style: { animationDelay: `${i * 70}ms` },
					children: line.text
				}, `${line.text}-${i}`))
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pb-screen flex justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "text",
				onClick: onStart,
				className: "min-h-11 px-8",
				children: pack.intro.start
			})
		})]
	});
}
function Home() {
	const navigate = useNavigate();
	const hydrate = useLedger((s) => s.hydrate);
	const start = useLedger((s) => s.start);
	(0, import_react.useEffect)(() => {
		hydrate();
	}, [hydrate]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stage, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntroScreen, { onStart: () => {
		start();
		navigate({
			to: "/q/$step",
			params: { step: "1" }
		});
	} }) });
}
//#endregion
export { Home as component };
