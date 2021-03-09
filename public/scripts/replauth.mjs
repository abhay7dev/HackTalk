if (location.host != "hacktalk.epicgamer007.repl.co") location.host = "hacktalk.epicgamer007.repl.co";

const button = document.querySelector(".repl-auth-button");

const auth = () => {
	const width = 400,
		height = 500;
	const left = (screen.width / 2) - (width / 2),
		top = (screen.height / 2) - (height / 2);

	const authWindow = window.open(
		`https://repl.it/auth_with_repl_site?domain=${location.host}`,
		`_blank`,
		`modal=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
	);

	window.addEventListener(
		"message",
		e => {
			if (e.data === "auth_complete") {
				authWindow.close();
				location.reload();
			}
		}
	);
};

button.addEventListener(
	"click",
	auth, {
		passive: true
	}
);

button.classList.remove("hidden");