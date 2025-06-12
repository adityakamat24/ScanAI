const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🛡️ Rate Limiter (20 requests per minute per IP)
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,             // Limit each IP to 20 requests per windowMs
    message: {
        status: 429,
        error: 'Too many requests — please try again after a minute.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to all /api routes
app.use('/api', limiter);

app.use(cors());
app.use(express.json());

app.post('/api/analyze', async (req, res) => {
    try {
        const { imageData, profile } = req.body;

        const prompt = `
      A user uploaded a food label. Profile:
      - Age: ${profile.age || 'unknown'}
      - Allergies: ${profile.allergies?.join(', ') || 'none'}
      - Conditions: ${profile.conditions?.join(', ') || 'none'}
      Analyze ingredients for risks. Here's the image/text: ${imageData}
    `;

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: 'You are a food safety assistant.' },
                    { role: 'user', content: prompt }
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json(response.data.choices[0].message.content);
    } catch (error) {
        console.error('Error analyzing:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Backend running at http://localhost:${PORT}`);
});
