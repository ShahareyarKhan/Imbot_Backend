// Import Express for creating the server and handling requests
const express = require('express');

// dotenv: Loads environment variables from a .env file into process.env
const dotenv = require('dotenv');
dotenv.config(); // Initialize dotenv to access environment variables

// Database connection function
const connectDB = require('./db');

// Import CORS to allow cross-origin requests (e.g., frontend can access backend)
const cors = require('cors'); 

const app = express(); // Initialize Express application

// Middleware to parse incoming JSON data in requests
app.use(express.json());

// Enable CORS for all origins (all frontend applications can access backend)
app.use(cors());

// Middleware to parse URL-encoded data (form data)
app.use(express.urlencoded({ extended: true }));

// Set EJS as the template/view engine
app.set('view engine', 'ejs');

// Connect to the database
connectDB();

// Basic route to check if backend is working
app.get('/', (req, res) => {
  res.send('Backend working properly.');
});

// Define routes for authentication and PDF handling
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pdf', require('./routes/pdfhandle'));

// Start server and listen on port 3000
app.listen(3000, () => {
  console.log("Backend Working.");
});



// The package.json file is a crucial part of a Node.js project, as it contains metadata about the project and its dependencies.

// While package.json lists the dependencies and their versions, the package-lock.json provides a more detailed snapshot of the entire dependency tree, including the exact versions of every installed package and its dependencies.