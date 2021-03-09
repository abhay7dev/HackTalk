document
	.body
	.querySelector("button#back")
	.addEventListener(
		"click",
		history.back.bind(history), {
			passive: true
		}
	);