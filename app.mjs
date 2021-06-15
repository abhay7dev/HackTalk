"use strict";

import {
	mods,
	banned,
	debug as DEBUG,
	reset as RESET
} from "./modules/config.mjs";

if (DEBUG >= 1) {
	console.warn("\u001b[33mDebug Mode is active (level %i)\u001b[0m", DEBUG);
}

// Debug scale:
// these should effect the amount of debug information exposed too
// 0 -> full debug info
// 1 -> ...
// 2 -> more moderate
// 3 -> ...
// 4 -> frontend debugging mode
// ...
// 10 -> no debug info
// ... on from there

if (DEBUG <= 2) {
	console.time("Initialisation");
}

import * as debug from "./modules/debug.mjs";

import { __dirname } from "./modules/misc.mjs";

import express from "express";
const app = express();

import http from "http";
const server = http.createServer(app);

import { window } from "./modules/window.mjs";

import { promises as fs } from "fs";
import replaceAll from "./modules/replaceAll.mjs";

import * as db from "./modules/db.mjs";

import parseMarkdown from "./modules/md.mjs";

import rateLimit from "express-rate-limit"

const banUser = async user => {
	await db.banUser(user);

	banned.add(user);
};

// I'm thinking of a promise that resolves once first called or smth
const getBanned = async () => {
	if (banned.has("$")) {
		banned.delete("$");
		const bannedUsers = await db.getBannedUsers();

		bannedUsers.forEach(user => banned.add(user));
		// xh, do not change this. it will break.
	}

	return banned;
};

const replitUserData = new Map;

const getUserData = async _user => {
	const user = _user.toLowerCase();

	if (!replitUserData.has(user)) {
		// replitUserData.set(user, await (await window.fetch(`https://repl.it/data/profiles/${user}`)).json());
	}

	return replitUserData.get(user);
};

// Map<username, { body: Info, link: string }[]>
const notifications = new Map;
// stored in memory; no db

const notify = (_user, information, link) => {
	const user = _user.toLowerCase();

	const new_data = {
		body: information,
		link
	};

	if ( notifications.has(user) ) {
		notifications.get(user).push(new_data);
	} else {
		notifications.set(user, [ new_data ]);
	}
};

const scanPostForPingAndNotify = (body, qid, author) => {
	body.match(/(?<=@)\w+((?=\W)|$)/g)
		?.map(user => user.toLowerCase())
		.filter(user => user !== author)
		.forEach(user => notify(user, `@${author} mentioned you in a post`, `/question-${qid}`));
};

const { REPL_SLUG, REPL_OWNER } = process.env;
const replDomain = `https://${REPL_SLUG}.${REPL_OWNER}.repl.co`.toLowerCase();

{
	const csp_headers = `
		upgrade-insecure-requests;
		default-src 'self' https://repl.it;
		style-src 'self' https://fonts.googleapis.com/css2;
		style-src-elem 'self' https://fonts.googleapis.com/css2;
		style-src-attr 'none';
		font-src https://fonts.gstatic.com;
		child-src 'none';
		connect-src https://repl.it;
		frame-src 'none';
		manifest-src 'none';
		img-src *;
		media-src *;
		object-src 'none';
		prefetch-src 'none';
		script-src 'self';
		script-src-elem 'self';
		script-src-attr 'none';
		worker-src 'none';
	`.replace(/\s/g, ' ');

	const base_headers = {
		"Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
		"Upgrade-Insecure-Requests": "1",
		"Content-Security-Policy": csp_headers
	};

	const publicPages = new Set([
		"/",
		"/login",
		"/why-replit",
		"/rules",
		"/styles/style.css",
		"/images/winters-favicon.png",
		"/scripts/replauth.mjs"
	]);

	app.use(async (req, res, next) => {
		res.set(base_headers);

		const username = req.get("X-Replit-User-Name");

		if ( (await getBanned()).has(username) ) {
			res.sendFile(`${__dirname}/static/banned.html`);
		} else if ( publicPages.has(req.path) || username ) {
			next();
		} else {
			res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
		}
	});

	// block outside requests
	app.use(async (req, res, next) => {

		// deny outside requests
		pass: if (req.method === "POST") { // fall through
			deny: { // send 403
				const referer = req.get("referer");

				console.log(referer);

				// can this ever be true?
				if (typeof referer !== "string") {
					// console.log("not string!");
					break deny;
				}

				let originHost;

				try {
					const { hostname: tmp } = new URL(referer);
					originHost = tmp;
				} catch {
					// URL constructor may throw
					break deny;
				}

				const { hostname: replDomainHost } = new URL(replDomain);

				console.log(originHost);
				console.log(replDomainHost);
				if (originHost !== replDomainHost) {
					// console.log("not origin!");
					break deny;
				}

				break pass;
			}

			// deny
			res
				.status(403)
				.render(`${__dirname}/public/views/error.ejs`, { errorCode: 403 });
			return;
		}
		// fallthrough

		// pass
		next();
	});
}

app.use(express.json({ limit: "500kb" }));
app.use(express.urlencoded({ extended: true, limit: "500kb" }));

app.set("view-engine", "ejs");

if (RESET) {
	db.reset().then( () => { process.exit(0); });
}

{
	const callback = DEBUG >= 1
		? ({ params: { page } }, res) => {
			res.sendFile(`${__dirname}/public/${decodeURIComponent(page)}`);
		} : (_req, res) => {
			res.send("Debugging is disabled.");
		};

	app.get("/debug/:page", callback);
}

app.get("/scripts/:file", ({ params: { file } }, res) => {
	res.sendFile(`${__dirname}/public/scripts/${ file }`);
});

app.get("/styles/:file", ({ params: { file } }, res) => {
	res.sendFile(`${__dirname}/public/styles/${ file }`);
});

app.get("/images/:file", ({ params: { file } }, res) => {
	res.sendFile(`${__dirname}/public/images/${ file }`);
});

app.get("/statuspg/:code", ({ params: { code: errorCode } }, res) => {
	res.render(`${__dirname}/public/views/error.ejs`, { errorCode });
});

app.use(rateLimit({
	windowMs: 60 * 1000,
	max: 60
}));

app.get("/login", (req, res) => {
	const { next } = req.query;

	if ( req.get("X-Replit-User-Id") ) {
		console.log(req.cookies)
		res.redirect(
			next
				? decodeURIComponent(next)
				: "/profile"
		);
	} else {
		res.sendFile(`${__dirname}/public/static/login.html`);
	}
});

app.get("/profile", async (req, res) => {
	const username = req.get("X-Replit-User-Name");

	res.render(
		`${__dirname}/public/views/profile.ejs`, {
			username,
			admin: mods.has(username),
			notifications: notifications.get(username.toLowerCase()) ?? [],
			questions: await Promise.all(
				(await db.getQuestions())
					.reverse()
					.map(db.getQuestionData)
			)
		}
	);
});

// send HTTP 303 afterward?
app.post("/question", async (req, res) => {
	const { question } = req.body;

 	if(!question || question == null || (''+question).length == 0) {
      	res.status(403).send("Error, question not found");
        return;
    }
	if (/^\W+$/.test(question)) { // if question is purely made of non-word characters
		res.sendFile(`${__dirname}/public/static/bad-input.html`);
	} else {
		const author = req.get("X-Replit-User-Name");

		const num = await db.createQuestion({
			author,
			body: parseMarkdown(question)
		});

		scanPostForPingAndNotify(question, num, author);

		res.redirect(`/question-${num}`);
	}
});

app.post("/delete/:qid", async (req, res) => {
	if (mods.has(req.get("X-Replit-User-Name"))) {
		await db.deleteQuestion(req.params.qid);
		res.sendFile(`${__dirname}/public/static/success.html`);
	} else {
		res.status(403).render(`${__dirname}/public/views/error.ejs`, { errorCode: 403 });
	}
});

app.post("/delete/:qid/:aid", async (req, res) => {
	const { qid, aid } = req.params;

	if (mods.has(req.get("X-Replit-User-Name"))) {
		await db.deleteAnswer(qid, aid);
		res.sendFile(`${__dirname}/public/static/success.html`);
	} else {
		res.status(403).render(`${__dirname}/public/views/error.ejs`, { errorCode: 403 });
	}
});

// make a more general `admin-only`` pages dir and block based on that

app.get("/ban", (req, res) => {
	mods.has(req.get("X-Replit-User-Name"))
		? res.sendFile(`${__dirname}/public/static/ban.html`)
		: res.status(403).render(`${__dirname}/public/views/error.ejs`, { errorCode: 403 });
});

app.post("/ban", async (req, res) => {
	const { user } = req.body;

	if (mods.has(req.get("X-Replit-User-Name"))) {
		if (mods.has(user)) {
			res.status(400).sendFile(`${__dirname}/public/static/bad-input.html`);
		} else {
			await banUser(user);
			res.sendFile(`${__dirname}/public/static/success.html`);
		}
	} else {
		res.status(403).render(`${__dirname}/public/views/error.ejs`, { errorCode: 403 });
	}
});

app.post("/answer-:qid", async (req, res) => {
  try {
	const {
		body: { answer },
		params: { qid }
	} = req;

	const author = req.get("X-Replit-User-Name");

	scanPostForPingAndNotify(answer, qid, author); // wait im getting something wrong but i know its in this post method
// The issue is that the await opens a new thread.
	console.log("hi");
// then how would we fix this?
	db
		.getQuestionData(qid)
		.then(({ author: qauthor }) => {
    	if((''+author).length > 0 && author != null) return null;
			return qauthor !== author
				? notify(qauthor, `@${author} responded to your question`, `/question-${qid}`)
				: null
    }
	);

	if (/^\W+$/.test(answer)) {
		res.sendFile(`${__dirname}/public/static/bad-input.html`);
	} else {
		await db.answerQuestion(qid, {
			author,
			body: parseMarkdown(answer)
		});

		res.redirect(`/question-${qid}`);
	}} catch(err) {
		res.redirect('/');
	}
});

app.get("/question-:num", async (req, res) => {

	// requestee/viewer
	const is_admin = mods.has(
		req.get("X-Replit-User-Name")
	);

	const qdata = await db.getQuestionData(req.params.num);

	if (qdata.error) {
		res.render(
			`${__dirname}/public/views/error.ejs`, {
				errorCode: qdata.error === "Not found"
					? 404
					: 500
			}
		);

		return;
	}

	const username = qdata.author;

	const author = {
		username,
		isModerator: mods.has(username)
	};

	const answers = qdata.answers
		?.reverse()
		.map(
			({ author, body, id }) => ({
				author: {
					username: author,
					isModerator: mods.has(author),
					data: getUserData(author)
				},
				body,
				id
			})
		) ?? [];

	const data = {
		...qdata,
		admin: is_admin,
		author,
		answers
	};

	res.render(
		`${__dirname}/public/views/question.ejs`,
		data
	);
});

app.get("/notification-:id", (req, res) => {
	const id = parseInt(req.params.id, 10);

	const user = req.get("X-Replit-User-Name").toLowerCase();

	const user_notifs = notifications.get(user);
	const next = user_notifs?.[id]?.link ?? "/profile";

	// Set#remove would be nice
	delete user_notifs?.[id];

	res.redirect(next);
});

app.use(async (err, _req, res, _next) => {
	if (err) {
		console.error(err);

		// debug
		if (DEBUG >= 2) {
			await fs.appendFile(`${__dirname}/logs/errors.log`, `\n\n${new Date} : ${err}`);
		}

		res.status(500).render(`${__dirname}/public/views/error.ejs`, { errorCode: 500 });
	}
});

{
	const port = 5050;

	server.listen(port, () => {
		const time = new Date().toLocaleString();

		console.log("listening on port:%i, starting at %s UTC time\n", port, time);

		if (DEBUG >= 2) {
			console.timeEnd("Initialisation");
		}
	});
}

// update!
{
	const page_mapping = new Map([
		[ "", "index.html" ],
		[ "why-replit", "why-use-replit.html" ],
		[ "rules", "rules.html" ],
		[ "statuspg", "success.html" ],
		[ "ask", "submit.html" ],
		[ "/favicon.ico", "images/winters-favicon.ico" ]
	].map(
		([ start, end ]) =>
			[
				`/${start}`,
				`${__dirname}/public/static/${end}`
			]
	));

	// debug.assert page_mapping valid files

	app.get(
		"*",
		(request, response) => {
			const { url } = request;

			if ( page_mapping.get(url) ) {
				response
				.status(200)
				.sendFile(
					page_mapping.get(url)
				);
			} else {
				response
				.status(404)
				.render(
					`${__dirname}/public/views/error.ejs`,
					{ errorCode: 404 }
				);
			}
		}
	);
}