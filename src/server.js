const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Path to your seed.json (Assuming it's in the root folder)
const seedPath = path.join(__dirname, '../seed.json');

// The Theory API
app.get('/api/break/:title', async (req, res) => {
    try {
        const movieTitle = req.params.title.toLowerCase();
        
        // 1. Check Seeded Memory
        const rawData = fs.readFileSync(seedPath, 'utf8');
        const seededData = JSON.parse(rawData);
        const seeded = seededData.find(m => m.title.toLowerCase() === movieTitle);
        
        if (seeded) return res.json(seeded);

        // 2. AI Engine (If not seeded)
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "API Key Missing in Hostinger" });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `Analyze the film "${movieTitle}". Provide a 300-word theory for Break4th. Focus on subtext and the 4th wall.`;
        const result = await model.generateContent(prompt);
        
        res.json({ title: movieTitle, theory: result.response.text() });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "The Fourth Wall held up. Try again." });
    }
});

// Hostinger usually listens on 3000, but we use 0.0.0.0 for external access
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Break4th Engine listening on port ${PORT}`);
});