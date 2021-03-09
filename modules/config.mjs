import fs from "fs";

const config = JSON.parse(
	fs.readFileSync("configuration.json")
);

if (typeof config !== "object") {
	console.warn("configuration was not provided!");
}

export const
	mods = new Set(config?.users.moderators ?? []),
	banned = new Set(config?.users.banned ?? []).add("$"),
	debug = config?.debug ?? 0,
	reset = config?.reset ?? (process.env.RESET == "true") ?? false;