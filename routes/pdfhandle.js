// Import required modules
const mongoose = require("mongoose");
const User = require("../Models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');

// Configure multer to store uploaded files in memory (instead of disk)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route to handle PDF uploads and parse text from PDF
router.post('/upload-pdf', upload.single('file'), async (req, res) => {
  try {
    // The PDF file is available as req.file.buffer
    const pdfData = await pdfParse(req.file.buffer); // Parse text from PDF buffer
    const pdfText = pdfData.text; // Extract text from PDF

    res.json({ message: 'PDF processed successfully', text: pdfText }); // Send extracted text as response
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
