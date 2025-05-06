# Dan's Culinary (CSc 337 Project)

A web application built with Node.js, Express, and MongoDB where users can share and find recipes.

## Contributors
*   Anuj Jariwala
*   Advait Khopade

## Features

*   User registration and login system.
*   Session management for persistent logins.
*   Password hashing using Node.js `crypto` module (PBKDF2).
*   Users can submit their own recipes (title, description, ingredients, instructions, optional image URL).
*   View a list of all user-submitted recipes on the home page.
*   View details of a single user-submitted recipe.
*   Search for external recipes using the Spoonacular API.

## Modules

1.  **User Module:** Handles `/register`, `/login`, `/logout`, session management.
2.  **Recipe Module:** Handles `/api/recipes` (POST for adding, GET for listing/details).
3.  **Search Module:** Client-side interaction with Spoonacular API via `/js/search.js`.

## Technologies Used

*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB (using `mongodb` driver)
*   **Frontend:** HTML, CSS, JavaScript (Vanilla JS with Fetch API)
*   **Authentication:** `express-session` for session management, Node.js `crypto` for password hashing.
*   **Environment Variables:** `dotenv`
*   **External API:** Spoonacular

## Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url> 
    cd <your-repo-name>
    ```
    or download the zip file.
    ```bash
    cd Dan\'s culinary
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Setup MongoDB:**
    *   Ensure you have MongoDB installed and running locally.
    *   The default connection string used is `mongodb://localhost:27017/recipeAppDB`. You can change this.
4.  **Create Environment File:**
    *   Create a file named `.env` in the project root directory.
    *   Add the following content, replacing placeholder values:
        ```dotenv
        # Session Configuration
        SESSION_SECRET=replace_with_a_very_long_and_random_secret_key

        # MongoDB Configuration
        MONGO_URI=mongodb://localhost:27017/recipeAppDB

        # Spoonacular API Key (Get from https://spoonacular.com/food-api)
        SPOONACULAR_API_KEY=replace_with_your_spoonacular_api_key
        ```
    *   **IMPORTANT:** Do not commit the `.env` file to version control. It's included in `.gitignore`.
5.  **Run the application:**
    ```bash
    npm start
    ```
    Or directly using node:
    ```bash
    node server.js
    ```
6.  **Access the application:**
    Open your web browser and navigate to `http://localhost:3000` (or the port specified if different).

## Project Requirements Checklist

*   [x] Minimum of three interconnected modules (User, Recipe, Search)
*   [x] User module with authentication (login, logout, registration)
*   [x] Use of session management (`express-session`)
*   [x] Data persistence using MongoDB
*   [x] Logical navigation between pages (HTML links, redirects)
*   [x] Working frontend using HTML, CSS, JavaScript (Vanilla JS, Fetch API)
*   [x] Working backend code using Node.js, Express
*   [x] Technologies taught in class used.
*   [x] Spoonacular API integration implemented.
*   [x] No EJS used.

## Notes

*   Password hashing uses Node.js `crypto.pbkdf2Sync` which is more secure than basic SHA256 hashing shown in early slides.
*   Spoonacular API key is fetched via a simple backend endpoint (`/api/config/spoonacular-key`) when needed by the client-side search script. This endpoint requires the user to be logged in as a basic security measure.
*   Error handling is basic; could be improved for production.
*   Styling in `style.css` is minimal; needs further development for a polished look.