const r = String.raw;

const regexSpecialChars = new Set(r`!@#$^&%*()+=-[]\{}|:<>?,.`);

const escaper = letter =>
	regexSpecialChars.has(letter)
		? `\\${letter}`
		: letter;

const replaceAll = (search, replace, text) =>
	String(text).replace(
		new RegExp(
			Array
			.from(search, escaper)
			.join(""),
			"gi"
		),
		replace
	);

export default replaceAll;