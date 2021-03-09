import * as window from "./window.mjs";

export { window };

export const
	globalThis = window,
	self = window,
	frames = window,
	top = window,
	parent = window;

export const btoa = text => Buffer.from(text).toString("base64");

export const atob = text => Buffer.from(text, "base64").toString();

import fetch from "node-fetch";

export { fetch };

{
	const r = String.raw;

	const regexSpecialChars = new Set(r`!@#$^&%*()+=-[]\{}|:<>?,.`);

	const escaper = letter =>
		regexSpecialChars.has(letter)
			? `\\${letter}`
			: letter;

	String.prototype.replaceAll = function replaceAll (search, replace) {
		String(this).replace(
			new RegExp(
				Array
				.from(search, escaper)
				.join(""),
				'g'
			),
			replace
		);
	}
}