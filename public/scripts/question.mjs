document
	.querySelectorAll(".answer[data-poster]")
	.forEach(
		async answer => {
			const url = `https://repl.it/data/profiles/${answer.getAttribute("data-poster")}`;

			const proxy = "https://cors-anywhere.herokuapp.com/";

			const data = await fetch(proxy + url, {
				mode: "cors",
				cache: "default"
			});

			const json = await data.json();

			console.dir(json);

			answer.querySelector("img").classList.remove("hidden");

			answer.querySelector("img").setAttribute("src", json.icon.url);
		}
	);