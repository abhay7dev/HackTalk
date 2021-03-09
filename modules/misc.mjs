export const __dirname = new URL("../", import.meta.url).pathname;

// DEBUG:
// confirm __dirname points to a folder not a file, specificially a valid folder

console.log("__dirname is \"%s\"", __dirname);