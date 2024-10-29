const mongoose = require("mongoose");
const User = require("../Models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

// Use dynamic import for node-fetch
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const HUGGING_FACE_API_KEY = "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";
const upload = multer({ dest: 'uploads/' });

router.post('/upload-pdf', upload.single('file'), async (req, res) => {
  try {
    console.log("Trying...");
    const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
    const fileData = await fs.promises.readFile(filePath);

    const pdfData = await pdfParse(fileData);
    const pdfText = pdfData.text;
    await fs.promises.unlink(filePath);
    res.json({ message: 'PDF processed successfully', text: pdfText });
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ error: 'Failed to process PDF' });
  }
});


router.post('/store-in-db', async (req, res) => {
  try {
    const authToken = req.header('Authorization'); // Assuming token is sent in the Authorization header
    const { botName, text: botText } = req.body;

    if (!authToken || !botText || !botName) {
      return res.status(400).json({ success: false, message: "Authorization token, bot name, and bot text are required." });
    }

    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    const userId = decoded.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { bots: { botName, botText } } },
      { new: true, useFindAndModify: false }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.json({ success: true, message:"Bot Created."});
  } catch (error) {
    console.error(error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: "Invalid token." });
    }
    res.status(500).send("Internal Server Error");
  }
});




module.exports = router;
