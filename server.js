require('dotenv').config(); // Load .env variables first
const express = require('express');
const path = require('path');
const session = require('express-session');
const { MongoClient, ObjectId } = require('mongodb'); // Import ObjectId
const { hashPassword, verifyPassword } = require('./server/utils/authUtils');

const app = express();
const port = process.env.PORT || 3000;

// --- Database Connection ---
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);
let db;
let usersCollection;
let recipesCollection;

async function connectDB() {
    try {
        await client.connect();
        db = client.db(); // Use the default DB specified in URI or add a name client.db("recipeAppDB")
        usersCollection = db.collection('users');
        recipesCollection = db.collection('recipes');
        console.log("Successfully connected to MongoDB.");
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
        process.exit(1); // Exit if DB connection fails
    }
}

// --- Middleware ---
// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));
// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET, // Use secret from .env
    resave: false,
    saveUninitialized: false, // Don't save sessions for unauthenticated users
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        maxAge: 1000 * 60 * 60 * 24 // Cookie expiry time (e.g., 1 day)
    }
}));

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next(); // User is logged in, proceed
    } else {
        // If it's an API request, send 401, otherwise redirect to login
        if (req.originalUrl.startsWith('/api/')) {
             res.status(401).json({ message: 'Unauthorized: Please log in.' });
        } else {
            res.redirect('/login.html');
        }
    }
}

// --- Routes ---

// --- User Authentication Routes ---
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required.');
    }

    try {
        const existingUser = await usersCollection.findOne({ username: username });
        if (existingUser) {
            return res.status(409).send('Username already exists. Please choose another.');
        }

        const { salt, hash } = hashPassword(password);
        await usersCollection.insertOne({ username: username, salt: salt, hash: hash });
        console.log(`User registered: ${username}`);
        res.redirect('/login.html?registered=true'); // Redirect to login after registration

    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).send('Registration failed. Please try again later.');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required.');
    }

    try {
        const user = await usersCollection.findOne({ username: username });
        if (!user) {
            return res.status(401).send('Invalid username or password.');
        }

        const isPasswordValid = verifyPassword(password, user.salt, user.hash);
        if (!isPasswordValid) {
            return res.status(401).send('Invalid username or password.');
        }

        // Store user info in session (DO NOT store password/hash/salt)
        req.session.user = {
            _id: user._id,
            username: user.username
        };
        console.log(`User logged in: ${username}`);
        res.redirect('/?loggedin=true'); // Redirect to home page after login

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).send('Login failed. Please try again later.');
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Logout error:", err);
            return res.status(500).send('Could not log out.');
        }
        res.redirect('/login.html?loggedout=true'); // Redirect to login after logout
    });
});

// API endpoint to check login status and get user info
app.get('/api/user/status', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});


// --- Recipe Routes (API for client-side JS) ---

// Get all user-submitted recipes
app.get('/api/recipes', async (req, res) => {
    try {
        // Fetch recipes and add author username (lookup example)
        const recipes = await recipesCollection.aggregate([
            {
                $lookup: {
                    from: "users", // The collection to join with
                    localField: "authorId", // Field from the recipes collection
                    foreignField: "_id", // Field from the users collection
                    as: "authorInfo" // The name of the new array field to add
                }
            },
            {
                $unwind: "$authorInfo" // Deconstructs the array field from the lookup
            },
            {
                $project: { // Select/reshape the fields to return
                    _id: 1,
                    title: 1,
                    description: 1,
                    imageUrl: 1, // Add if you store images
                    authorUsername: "$authorInfo.username" // Get username from joined data
                }
            }
        ]).toArray();
        res.json(recipes);
    } catch (err) {
        console.error("Error fetching recipes:", err);
        res.status(500).json({ message: 'Failed to fetch recipes.' });
    }
});

// Get a single user-submitted recipe by ID
app.get('/api/recipes/:id', async (req, res) => {
    const recipeId = req.params.id;
    try {
        // Validate if the ID is a valid MongoDB ObjectId
        if (!ObjectId.isValid(recipeId)) {
            return res.status(400).json({ message: 'Invalid recipe ID format.' });
        }

        const recipe = await recipesCollection.findOne({ _id: new ObjectId(recipeId) });

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found.' });
        }

        // Optionally, lookup author info if needed for detail view
        const author = await usersCollection.findOne({ _id: recipe.authorId });
        recipe.authorUsername = author ? author.username : 'Unknown';

        res.json(recipe);
    } catch (err) {
        console.error(`Error fetching recipe ${recipeId}:`, err);
        res.status(500).json({ message: 'Failed to fetch recipe details.' });
    }
});


// Add a new recipe (Protected Route)
app.post('/api/recipes', isAuthenticated, async (req, res) => {
    const { title, description, ingredients, instructions, imageUrl } = req.body; // Add imageUrl if used

    if (!title || !description || !ingredients || !instructions) {
        return res.status(400).json({ message: 'Missing required recipe fields.' });
    }

    try {
        const newRecipe = {
            title,
            description,
            ingredients: ingredients.split('\n'), // Assuming textarea input separated by newlines
            instructions: instructions.split('\n'), // Assuming textarea input separated by newlines
            imageUrl: imageUrl || '', // Optional image URL
            authorId: new ObjectId(req.session.user._id), // Link to the logged-in user
            createdAt: new Date()
        };

        const result = await recipesCollection.insertOne(newRecipe);
        console.log(`Recipe added: ${title} by ${req.session.user.username}`);
        // Send back the newly created recipe with its ID
        res.status(201).json({ message: 'Recipe added successfully!', recipeId: result.insertedId });

    } catch (err) {
        console.error("Error adding recipe:", err);
        res.status(500).json({ message: 'Failed to add recipe.' });
    }
});

// --- Spoonacular API Key Route (Simple proxy to avoid exposing key in client-side JS) ---
// This is a basic security measure. More robust solutions exist.
app.get('/api/config/spoonacular-key', isAuthenticated, (req, res) => {
    // Only send the key if the user is logged in
    res.json({ apiKey: process.env.SPOONACULAR_API_KEY });
});


// --- Catch-all for serving HTML files (if not matched by static middleware) ---
// This allows direct navigation to /login.html, /register.html etc.
app.get('/:pageName', (req, res, next) => {
    const pageName = req.params.pageName;
    // Basic check to prevent directory traversal and serve only known html files
    const allowedPages = ['index.html', 'login.html', 'register.html', 'profile.html', 'add-recipe.html', 'recipe-detail.html'];
    if (allowedPages.includes(pageName)) {
        res.sendFile(path.join(__dirname, 'public', pageName));
    } else {
        // If the page is not found or not allowed, pass to the 404 handler
        next();
    }
});

// --- 404 Handler ---
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html')); // Optional: Create a 404.html page
    // Or just send text: res.status(404).send("Sorry, page not found!");
});

// --- Error Handler ---
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.stack);
    res.status(500).send('Something broke!');
});


// --- Start Server ---
connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Dan's Culinary listening at http://localhost:${port}`);
    });
});