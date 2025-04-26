import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import wordRoutes from './routes/Words.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

// Use the routes
app.use('/api', wordRoutes);

// Start the server
const server = app.listen(process.env.PORT || PORT, () => {
    console.log(`Server is running on port ${process.env.PORT || PORT}`);
});

export { app, server };