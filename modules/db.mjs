import Client from "replitdb-client";
export const client = new Client;

import { window } from "./window.mjs";

export const getQuestionData = async (qid) => {
	const [ question, answerids ] = await Promise.all([
		client.get(`${qid}__message`),
		client.list(`${qid}__answer__`)
	]);

	if (!question) {
		return { error: "Not found" };
	}

	const answers = (await Promise.all(
		answerids
			.split('\n')
			.map(
				id => Promise.all([ client.get(id), id ])
			)
	)).map(
		([ answer, id ]) => ({ answer, id })
	);

	/* const answers = await Promise.all(
		answerids
			.split('\n')
			.map(
				async id => {
					answer: await client.get(id),
					id
				}
			)
	); */

	const questionData = question.split(process.env.SPLITTER);

	const id = typeof(qid) === "string"
		? parseInt(qid, 10)
		: qid;

	return {
		id,
		author: questionData[0],
		body: window.atob(questionData[1].replace(/ /g, "+")),
		answers: answers
			.filter(({ answer }) => (answer !== "$" && answer))
			.map(({ answer, id }) => {
				const answerData = answer.split(process.env.SPLITTER);

				return {
					id: id.substring(id.lastIndexOf("__") + 2),
					author: answerData[0],
					body: window.atob(answerData[1].replace(/ /g, "+"))
				};
			}
		)
	};
};

export const createQuestion = async ({ author, body }) => {
	const qid = (await client.get("messages")) ?? 0;
	const data = `${author}${process.env.SPLITTER}${window.btoa(body)}`;

	await Promise.all([
		client.set("messages", qid + 1),
		client.set(`${qid}__message`, data)
	]);

  return qid;
};

export const answerQuestion = async (qid, { author, body }) => {
	const data = `${author}${process.env.SPLITTER}${window.btoa(body)}`;

	const id = (await client.list(`${qid}__answer__`))
		.split("\n")
		.filter(Boolean)
		.length;
	await client.set(`${qid}__answer__${id}`, data);
};

const range = (min, max) =>
	new Array(max - min).keys();

export const getQuestions = async () => {
	const deletedQs = (await client.get("deleted"))?.split("_") ?? [];

	const questionCount = await client.get("messages");

	return [...range(0, questionCount)].filter(
		v => !deletedQs.includes(v.toString())
	);
};

export const reset = async () => {
	console.info("DB is being reset.");

	return await Promise.all([
		client.empty(),
		client.set("messages", 0),
		client.set("deleted", ""),
		client.set("banned", "")
	]);
};

export const getBannedUsers = async () => {
	return (((await client.get("banned"))?.split("_")) ?? []).filter(Boolean);
};

export const banUser = async (username) => {
	const bannedUsers = await client.get("banned");
	await client.set(
		"banned",
		`${bannedUsers ? bannedUsers + "_" : bannedUsers}${username}` // we had an issue with blocking @null
	);
};

export const deleteQuestion = async (qid) => {
	const deleted = await client.get("deleted");
	const keys = await client.list(`${qid}$REPLI__answer__`);
    
	await Promise.all([
		client.delete(`${qid}__message`),
		client.set("deleted", `${deleted}_${qid}`),
		...keys.split("\n").map(answer => client.delete(answer))
	]);
};

export const deleteAnswer = async (qid, aid) => {
	//await client.delete(`${qid}__answer__${aid}`);
	await client.set(`${qid}__answer__${aid}`, "$");
};