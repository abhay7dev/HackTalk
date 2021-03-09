// https://github.com/rsms/markdown-wasm

import markdown from "../node_modules/markdown-wasm/dist/markdown.js";

const { ParseFlags } = markdown;

const options = {
	asMemoryView: false,
	format: "html",
	parseFlags:
		ParseFlags.NO_HTML
		| ParseFlags.NO_INDENTED_CODE_BLOCKS
		| ParseFlags.COLLAPSE_WHITESPACE
		| ParseFlags.STRIKETHROUGH
		| ParseFlags.TABLES
		| ParseFlags.TASK_LISTS
};

export default text => markdown.parse(
	text.replace(/\[.+\]\(\s+javascript\:.+\)/g, "[unsafe link]"),
	options
);