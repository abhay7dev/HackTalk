const profile = document
	.querySelector("#profile")
	.classList;

const questions = document
	.querySelector("#questions")
	.classList;

const updateUi = () => {
	const [ not_hidden, hidden, title ] =
	location.hash === "#questions"
		? [ profile, questions, "HackTalk | Questions" ]
		: [ questions, profile, "HackTalk | Profile" ];

	not_hidden.add("hidden");

	hidden.remove("hidden");

	document.title = title;
};

self.addEventListener(
	"hashchange",
	updateUi, {
		passive: true
	}
);

for (const q of document.querySelectorAll("#messages .question")) {
	q.querySelector("p")
		.innerText =
	q.querySelector("template")
		.content
		.children[0]
		.innerText
		.replace(/\s/g, " ");
};

updateUi();