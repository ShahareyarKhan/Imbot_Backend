// Import required modules
const mongoose = require("mongoose"); // MongoDB driver
const User = require("../Models/User"); // User model for database operations
const bcrypt = require("bcrypt"); // For hashing passwords
const jwt = require("jsonwebtoken"); // For generating and verifying JWT tokens
const express = require("express"); // Express framework
const router = express.Router(); // Initialize router
const multer = require('multer'); // For handling file uploads
const pdfParse = require('pdf-parse'); // For parsing PDF files
const fs = require('fs'); // For filesystem operations
const path = require('path'); // For file path handling


// Configure multer to store uploaded files temporarily in 'uploads' folder
const upload = multer({ dest: 'uploads/' });

// Route to handle PDF uploads and parse text from PDF
router.post('/upload-pdf', upload.single('file'), async (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'uploads', req.file.filename); // Path to uploaded PDF file
    const fileData = await fs.promises.readFile(filePath); // Read file data

    const pdfData = await pdfParse(fileData); // Parse text from PDF
    const pdfText = pdfData.text; // Extract text
    await fs.promises.unlink(filePath); // Delete temporary file after processing
    res.json({ message: 'PDF processed successfully', text: pdfText }); // Send extracted text
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ error: 'Failed to process PDF' }); // Error response
  }
});

// Route to store bot details in the user's database entry
router.post('/store-in-db', async (req, res) => {
  try {
    const authToken = req.header('Authorization'); // Get JWT token from Authorization header
    const { botName, text: botText } = req.body; // Get bot name and text from request body

    // Check if required data is provided
    if (!authToken || !botText || !botName) {
      return res.status(400).json({ success: false, message: "Authorization token, bot name, and bot text are required." });
    }

    // Decode token to get user ID
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    const userId = decoded.user.id;

    // Update user document in the database to add new bot details
    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { bots: { botName, botText } } }, // Add bot to user's bots array
      { new: true, useFindAndModify: false } // Options to return updated document and avoid deprecated warnings
    );

    // Check if user exists
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.json({ success: true, message: "Bot Created." }); // Success response
  } catch (error) {
    console.error(error.message);

    // Handle invalid JWT token errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: "Invalid token." });
    }
    res.status(500).send("Internal Server Error"); // Server error response
  }
});

// Export router to be used in main app
module.exports = router;
