import { __dirname } from "./misc.mjs";
import { promises as fs } from "fs";

const assert = (expression, message, ...params) => {
	if (!expression) {
		console.error(message, ...params);

		process.exit(1);
	}
};

export default assert;

const TRUE = () => true;
const FALSE = () => false;

const exists = file_url => fs.stat(file_url).then(TRUE, FALSE);

export const assert_valid_file = async (file_url) => {
	assert(
		await exists(file_url),
		"File \"%s\" is not a valid file or directory!",
		file_url
	);
};

const error_file = `${__dirname}/logs/errors.log`;

const log_file = `${__dirname}/logs/actions.log`;

assert_valid_file(error_file);
assert_valid_file(log_file);

// DEBUG:
// ensure error_file is a valid file

export const log_error = error => fs.appendFile(error_file, `\n\n${new Date} : ${error}`);

export const log_action = log => fs.appendFile(log_file, `\n\n${new Date} : ${log}`);