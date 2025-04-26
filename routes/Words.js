import express from 'express';
import Word from '../models/Word.js'; // Import the Word model

const router = express.Router();

const HTTP_BAD_REQUEST = 400;
const HTTP_INTERNAL_SERVER_ERROR = 500;

// Add a word to the database
router.post('/addWord', async (req, res) => {
    const { word } = req.body;

    if (!word) {
        return res.status(HTTP_BAD_REQUEST).json({ error: 'Word is required' });
    }

    try {
        const newWord = new Word({ value: word });
        await newWord.save();
        return res.json({ message: 'Word added successfully' });
    } catch (err) {
        console.error('Error adding word:', err);
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({ error: 'Error adding word' });
    }
});

// View all words from the database
router.get('/viewWords', async (req, res) => {
    try {
        const words = await Word.find();
        return res.json(words);
    } catch (err) {
        console.error('Error fetching words:', err);
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({ error: 'Error fetching words' });
    }
});

export default router;