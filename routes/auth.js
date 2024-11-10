// Import required modules
const mongoose = require("mongoose"); // For interacting with MongoDB
const User = require("../Models/User"); // User model for database operations
const bcrypt = require("bcrypt"); // For hashing passwords
const jwt = require("jsonwebtoken"); // For generating and verifying JWT tokens
const express = require("express"); // Express framework
const router = express.Router(); // Create router instance

// Middleware for authenticating JWT tokens
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']; // Get token from Authorization header
    if (token == null) return res.sendStatus(401); // No token found, unauthorized
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => { // Verify token
        if (err) return res.sendStatus(403); // Invalid token, forbidden
        req.user = user; // Set user in request for further use
        next(); // Move to next middleware or route handler
    });
};

// Route for user signup
router.post("/signup", async (req, res) => {
    try {
        // Check if user already exists
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ error: "Sorry, a user with this email already exists" });
        }

        // Hash password before saving
        const salt = await bcrypt.genSalt(10); // Generate salt
        const hashedPassword = await bcrypt.hash(req.body.password, salt); // Hash password

        // Create new user
        user = await User.create({
            name: req.body.name,
            password: hashedPassword,
            email: req.body.email,
        });

        // Generate JWT token with user data
        const data = {
            user: {
                id: user.id
            }
        };
        const authtoken = jwt.sign(data, process.env.JWT_SECRET); // Sign token
        res.json({ success: true, authtoken }); // Send token to client

    } catch (error) {
        console.error("Error" + error.message);
        res.status(500).send("Internal Server Error"); // Server error
    }
});

// Route for user login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid Credentials." }); // User not found
        }

        // Compare provided password with stored hashed password
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ error: "Invalid Credentials." }); // Incorrect password
        }

        // Generate JWT token with user data
        const data = {
            user: {
                id: user.id,
            }
        };
        const authtoken = jwt.sign(data, process.env.JWT_SECRET); // Sign token
        res.json({ success: true, authtoken }); // Send token to client
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error"); // Server error
    }
});

// Route to get user details (requires token)
router.get('/getuser', async (req, res) => {
    try {
        const authToken = req.header('Authorization'); // Get token from Authorization header
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET); // Decode token
        const userId = decoded.user.id; // Extract user ID from token
        const user = await User.findById(userId).select("-password"); // Fetch user without password
        res.json({ success: true, user }); // Send user details
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error"); // Server error
    }
});

// Route to search users by name or email
router.post('/search', async (req, res) => {
    try {
        const { query } = req.body;

        // Check if query parameter is provided and is a string
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: "Query parameter is required and must be a string" });
        }

        // Search for users by name or email with case-insensitive matching
        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }).select("-password"); // Exclude password from result

        res.json({ success: true, users }); // Send matched users
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error'); // Server error
    }
});

module.exports = router; // Export router
