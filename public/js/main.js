/** @format */

document.addEventListener("DOMContentLoaded", () => {
	const authLinks = document.getElementById("auth-links");
	const userLinks = document.getElementById("user-links");
	const profileLink = document.getElementById("profile-link");
	const logoutButton = document.getElementById("logout-button");

	// Check login status when page loads
	fetch("/api/user/status")
		.then((response) => response.json())
		.then((data) => {
			if (data.loggedIn) {
				authLinks.style.display = "none";
				userLinks.style.display = "inline"; // Or 'block' depending on layout
				if (profileLink)
					profileLink.textContent = `Profile (${data.user.username})`;
			} else {
				authLinks.style.display = "inline"; // Or 'block'
				userLinks.style.display = "none";
			}
		})
		.catch((error) => console.error("Error fetching login status:", error));

	// Logout functionality
	if (logoutButton) {
		logoutButton.addEventListener("click", () => {
			fetch("/logout", { method: "POST" })
				.then((response) => {
					// Check if redirect happened (status code 200 usually means success here)
					if (response.ok || response.redirected) {
						window.location.href = "/login.html?loggedout=true"; // Redirect client-side
					} else {
						alert("Logout failed. Please try again.");
					}
				})
				.catch((error) => {
					console.error("Logout error:", error);
					alert("Logout failed. Please try again.");
				});
		});
	}

	// Display messages based on query params (e.g., after login/logout/register)
	const urlParams = new URLSearchParams(window.location.search);
	const messageContainer = document.createElement("div"); // Create a container for messages
	messageContainer.style.padding = "10px";
	messageContainer.style.marginTop = "10px";
	messageContainer.style.textAlign = "center";

	if (urlParams.has("registered")) {
		messageContainer.textContent =
			"Registration successful! Please log in.";
		messageContainer.style.backgroundColor = "#d4edda"; // Greenish background
		messageContainer.style.color = "#155724";
		document.body.insertBefore(messageContainer, document.body.firstChild);
	} else if (urlParams.has("loggedin")) {
		messageContainer.textContent = "Login successful!";
		messageContainer.style.backgroundColor = "#d4edda";
		messageContainer.style.color = "#155724";
		document.body.insertBefore(messageContainer, document.body.firstChild);
	} else if (urlParams.has("loggedout")) {
		messageContainer.textContent = "You have been logged out.";
		messageContainer.style.backgroundColor = "#cce5ff"; // Bluish background
		messageContainer.style.color = "#004085";
		document.body.insertBefore(messageContainer, document.body.firstChild);
	} else if (urlParams.has("recipe_added")) {
		messageContainer.textContent = "Recipe added successfully!";
		messageContainer.style.backgroundColor = "#d4edda";
		messageContainer.style.color = "#155724";
		document.body.insertBefore(messageContainer, document.body.firstChild);
	}

	// Remove message after a few seconds
	if (messageContainer.textContent) {
		setTimeout(() => {
			messageContainer.remove();
			// Clean the URL query parameters without reloading
			if (window.history.replaceState) {
				const cleanUrl =
					window.location.protocol +
					"//" +
					window.location.host +
					window.location.pathname;
				window.history.replaceState({ path: cleanUrl }, "", cleanUrl);
			}
		}, 3000); // Remove after 3 seconds
	}
});
