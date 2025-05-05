/** @format */

document.addEventListener("DOMContentLoaded", () => {
	const recipeListDiv = document.getElementById("recipe-list");
	const recipeDetailDiv = document.getElementById("recipe-detail"); // For recipe-detail.html
	const addRecipeForm = document.getElementById("add-recipe-form"); // For add-recipe.html

	// --- Load User Recipes on Home Page ---
	if (recipeListDiv && window.location.pathname === "/") {
		fetch("/api/recipes")
			.then((response) => {
				if (!response.ok)
					throw new Error(`HTTP error! status: ${response.status}`);
				return response.json();
			})
			.then((recipes) => {
				recipeListDiv.innerHTML = ""; // Clear loading message
				if (recipes.length === 0) {
					recipeListDiv.innerHTML =
						"<p>No recipes shared yet. Be the first!</p>";
					return;
				}
				recipes.forEach((recipe) => {
					const recipeElement = document.createElement("div");
					recipeElement.className = "recipe-summary"; // Add class for styling
					recipeElement.innerHTML = `
                        <h3><a href="/recipe-detail.html?id=${recipe._id}">${
						recipe.title
					}</a></h3>
                        <p>${recipe.description.substring(0, 100)}...</p>
                        <p><em>By: ${recipe.authorUsername}</em></p>
                        ${
							recipe.imageUrl
								? `<img src="${recipe.imageUrl}" alt="${recipe.title}" style="max-width: 100px; height: auto;">`
								: ""
						}
                    `;
					recipeListDiv.appendChild(recipeElement);
				});
			})
			.catch((error) => {
				console.error("Error loading recipes:", error);
				recipeListDiv.innerHTML =
					"<p>Could not load recipes. Please try again later.</p>";
			});
	}

	// --- Load Single Recipe Detail ---
	if (
		recipeDetailDiv &&
		window.location.pathname.includes("recipe-detail.html")
	) {
		const urlParams = new URLSearchParams(window.location.search);
		const recipeId = urlParams.get("id");

		if (recipeId) {
			fetch(`/api/recipes/${recipeId}`)
				.then((response) => {
					if (response.status === 404) {
						recipeDetailDiv.innerHTML = "<p>Recipe not found.</p>";
						throw new Error("Recipe not found"); // Stop further processing
					}
					if (!response.ok)
						throw new Error(
							`HTTP error! status: ${response.status}`
						);
					return response.json();
				})
				.then((recipe) => {
					recipeDetailDiv.innerHTML = `
                        <h2>${recipe.title}</h2>
                        <p><em>By: ${recipe.authorUsername}</em></p>
                        ${
							recipe.imageUrl
								? `<img src="${recipe.imageUrl}" alt="${recipe.title}" style="max-width: 300px; height: auto; margin-bottom: 15px;">`
								: ""
						}
                        <p><strong>Description:</strong> ${
							recipe.description
						}</p>
                        <h3>Ingredients</h3>
                        <ul>
                            ${recipe.ingredients
								.map((ing) => `<li>${ing}</li>`)
								.join("")}
                        </ul>
                        <h3>Instructions</h3>
                        <ol>
                            ${recipe.instructions
								.map((inst) => `<li>${inst}</li>`)
								.join("")}
                        </ol>
                        <p><a href="/">Back to recipes</a></p>
                    `;
				})
				.catch((error) => {
					console.error("Error loading recipe details:", error);
					if (recipeDetailDiv.innerHTML === "") {
						// Avoid overwriting 404 message
						recipeDetailDiv.innerHTML =
							"<p>Could not load recipe details. Please try again later.</p>";
					}
				});
		} else {
			recipeDetailDiv.innerHTML = "<p>No recipe ID specified.</p>";
		}
	}

	// --- Handle Add Recipe Form Submission ---
	if (addRecipeForm) {
		addRecipeForm.addEventListener("submit", (event) => {
			event.preventDefault(); // Prevent default form submission

			const formData = new FormData(addRecipeForm);
			const recipeData = {
				title: formData.get("title"),
				description: formData.get("description"),
				ingredients: formData.get("ingredients"),
				instructions: formData.get("instructions"),
				imageUrl: formData.get("imageUrl"), // Get optional image URL
			};

			fetch("/api/recipes", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(recipeData),
			})
				.then((response) => {
					if (!response.ok) {
						// Try to parse error message from server if available
						return response.json().then((err) => {
							throw new Error(
								err.message || "Failed to add recipe"
							);
						});
					}
					return response.json();
				})
				.then((data) => {
					console.log("Success:", data);
					// Redirect to the home page with a success message
					window.location.href = "/?recipe_added=true";
				})
				.catch((error) => {
					console.error("Error adding recipe:", error);
					alert(
						`Error: ${
							error.message ||
							"Could not add recipe. Make sure you are logged in."
						}`
					);
				});
		});
	}
});
