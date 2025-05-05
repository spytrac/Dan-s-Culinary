/** @format */

document.addEventListener("DOMContentLoaded", () => {
	const searchButton = document.getElementById("search-button");
	const searchQueryInput = document.getElementById("search-query");
	const searchResultsDiv = document.getElementById("search-results");
	let apiKey = null; // Store API key once fetched

	// Fetch API key from our backend proxy
	function getApiKey() {
		return fetch("/api/config/spoonacular-key")
			.then((response) => {
				if (!response.ok) {
					throw new Error(
						"Could not fetch API key configuration. Are you logged in?"
					);
				}
				return response.json();
			})
			.then((config) => {
				if (!config.apiKey) {
					throw new Error("API key not available from server.");
				}
				apiKey = config.apiKey; // Store the key
				return apiKey;
			});
	}

	function performSearch() {
		const query = searchQueryInput.value.trim();
		if (!query) {
			searchResultsDiv.innerHTML = "<p>Please enter a search term.</p>";
			return;
		}

		searchResultsDiv.innerHTML = "<p>Searching...</p>"; // Loading indicator

		// Ensure we have the API key before searching
		const apiKeyPromise = apiKey ? Promise.resolve(apiKey) : getApiKey();

		apiKeyPromise
			.then((key) => {
				// Construct the Spoonacular API URL
				const apiUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(
					query
				)}&number=10&apiKey=${key}`; // Limit to 10 results

				return fetch(apiUrl);
			})
			.then((response) => {
				if (!response.ok) {
					// Handle specific Spoonacular errors if possible
					if (response.status === 401 || response.status === 402) {
						throw new Error(
							"Spoonacular API key issue or quota exceeded."
						);
					}
					throw new Error(
						`Spoonacular API error! status: ${response.status}`
					);
				}
				return response.json();
			})
			.then((data) => {
				searchResultsDiv.innerHTML = ""; // Clear loading/previous results
				if (!data.results || data.results.length === 0) {
					searchResultsDiv.innerHTML =
						"<p>No recipes found for that query.</p>";
					return;
				}

				data.results.forEach((recipe) => {
					const recipeElement = document.createElement("div");
					recipeElement.className = "spoonacular-result"; // Class for styling
					// Note: Spoonacular provides image URLs. Link to recipe detail on Spoonacular or fetch more details if needed.
					// For simplicity, we link to a Google search for the recipe name.
					// A better approach would be to fetch recipe details using the recipe ID via another Spoonacular endpoint.
					recipeElement.innerHTML = `
                        <h4>${recipe.title}</h4>
                        <img src="${recipe.image}" alt="${
						recipe.title
					}" style="max-width: 150px; height: auto;">
                        <p><a href="https://www.google.com/search?q=${encodeURIComponent(
							recipe.title + " recipe"
						)}" target="_blank">View Recipe (External Search)</a></p>
                        <p><a href="https://spoonacular.com/recipes/${recipe.title.replace(
							/\s+/g,
							"-"
						)}-${
						recipe.id
					}" target="_blank">View on Spoonacular (approx link)</a></p>
                    `;
					searchResultsDiv.appendChild(recipeElement);
				});
			})
			.catch((error) => {
				console.error("Error searching Spoonacular:", error);
				searchResultsDiv.innerHTML = `<p>Could not perform search. Error: ${error.message}</p>`;
				// If API key fetch failed, clear the stored key so it tries again next time
				if (error.message.includes("API key")) {
					apiKey = null;
				}
			});
	}

	if (searchButton) {
		searchButton.addEventListener("click", performSearch);
	}
	if (searchQueryInput) {
		searchQueryInput.addEventListener("keypress", (event) => {
			if (event.key === "Enter") {
				performSearch();
			}
		});
	}
});
