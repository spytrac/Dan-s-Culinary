/** @format */

// public/js/auth.js

document.addEventListener("DOMContentLoaded", () => {
	const registerForm = document.getElementById("register-form");
	const loginForm = document.getElementById("login-form"); // If you want login validation too

	if (registerForm) {
		registerForm.addEventListener("submit", (event) => {
			const passwordInput = document.getElementById("password");
			const confirmPasswordInput =
				document.getElementById("confirm-password"); // Make sure you add this input to register.html if using this validation
			const usernameInput = document.getElementById("username");
			let isValid = true;
			let errorMessage = "";

			// --- Basic Validation Examples ---

			// 1. Check if username is empty (though 'required' attribute handles this mostly)
			if (!usernameInput.value.trim()) {
				isValid = false;
				errorMessage += "Username cannot be empty.\n";
				// You could add visual feedback here (e.g., border color)
			}

			// 2. Check if password is empty
			if (!passwordInput.value) {
				// No trim here, maybe allow spaces? Or trim if desired.
				isValid = false;
				errorMessage += "Password cannot be empty.\n";
			}

			// 3. Check if confirm password field exists and if passwords match
			if (confirmPasswordInput) {
				// Only run if the confirm password field exists in the HTML
				if (passwordInput.value !== confirmPasswordInput.value) {
					isValid = false;
					errorMessage += "Passwords do not match.\n";
					// Add visual feedback (e.g., make borders red)
					passwordInput.style.borderColor = "red";
					confirmPasswordInput.style.borderColor = "red";
				} else {
					// Reset border color if they match
					passwordInput.style.borderColor = ""; // Reset to default
					confirmPasswordInput.style.borderColor = ""; // Reset to default
				}
			}

			// --- Prevent Submission if Invalid ---
			if (!isValid) {
				event.preventDefault(); // Stop the form from submitting
				alert("Please fix the following errors:\n" + errorMessage);
				// You could also display the error message in a dedicated div on the page
			}
			// If isValid is true, the form will submit as normal.
		});
	}

	// You could add similar validation for the login form if needed
	if (loginForm) {
		loginForm.addEventListener("submit", (event) => {
			const usernameInput = document.getElementById("username");
			const passwordInput = document.getElementById("password");
			let isValid = true;
			let errorMessage = "";

			if (!usernameInput.value.trim()) {
				isValid = false;
				errorMessage += "Username cannot be empty.\n";
			}
			if (!passwordInput.value) {
				isValid = false;
				errorMessage += "Password cannot be empty.\n";
			}

			if (!isValid) {
				event.preventDefault();
				alert("Please fix the following errors:\n" + errorMessage);
			}
		});
	}
});
