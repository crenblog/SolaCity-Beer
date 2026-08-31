import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/narrate-CkhswZ4R.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var narrateMatch_createServerFn_handler = createServerRpc({
	id: "d1c6d03b77ee5b3bacd834c22570e5cf35c63a8348fc4c26d28f3dd3243d4c8a",
	name: "narrateMatch",
	filename: "src/lib/thin-path/narrate.ts"
}, (opts) => narrateMatch.__executeServer(opts));
var narrateMatch = createServerFn({ method: "POST" }).validator((input) => input).handler(narrateMatch_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "unavailable"
	};
	const choiceLines = data.choices.map((c) => `Q: ${c.prompt}\nA: ${c.answer}`).join("\n");
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			max_tokens: 80,
			temperature: .5,
			messages: [{
				role: "system",
				content: "You write one short Japanese sentence for a beer match card. No quotes, no emoji, no name of the beer, no hashtags. Tone: quiet, concrete, like a sommelier note. 18–32 Japanese characters."
			}, {
				role: "user",
				content: `Tonight's choices:\n${choiceLines}\n\nMatched beer line (do not copy verbatim): ${data.beerLine}\nBeer: ${data.beerName}\n\nWrite the sentence.`
			}]
		})
	});
	if (!res.ok) return {
		ok: false,
		error: `xAI ${res.status}`
	};
	const text = (await res.json()).choices?.[0]?.message?.content?.trim() ?? "";
	if (!text) return {
		ok: false,
		error: "empty"
	};
	return {
		ok: true,
		text: text.replace(/^["「]|["」]$/g, "")
	};
});
//#endregion
export { narrateMatch_createServerFn_handler };
