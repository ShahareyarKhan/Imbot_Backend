// backend/routes/youtube.js
const express = require('express');
const { YoutubeTranscript } = require('youtube-transcript');
const router = express.Router();

router.post('/get-transcript', async (req, res) => {
  const { videoId } = req.body;
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const fullText = transcript.map(item => item.text).join(' ');
    res.json({ transcript: fullText });
  } catch (error) {
    console.error('Transcript error:', error);
    res.status(500).json({ error: 'Failed to fetch transcript' });
  }
});

module.exports = router;
