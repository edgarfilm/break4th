import express from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';

const app = express();
app.use(express.json());

// Load your "First 5" movies from the seed file
const seededMovies = JSON.parse(fs.readFileSync('./seed.json', 'utf8'));

// The AI Logic
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/api/break/:title', async (req, res) => {
    const movieTitle = req.params.title.toLowerCase();

    // Check if we already have it
    const seeded = seededMovies.find(m => m.title.toLowerCase() === movieTitle);
    if (seeded) return res.json(seeded);

    // Otherwise, ask the AI
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Analyze the film "${movieTitle}". Provide a 300-word "Deep Theory" for Break4th.com. Focus on subtext and the fourth wall.`;
        const result = await model.generateContent(prompt);
        res.json({ title: movieTitle, theory: result.response.text() });
    } catch (error) {
        res.status(500).send("Error breaking the wall.");
    }
});

app.listen(3000, () => console.log("Break4th is live on port 3000"));