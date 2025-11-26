const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/message', async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }


        // Use gemini-2.0-flash for chat - confirmed available in model list
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Construct chat history if provided
        const chatHistory = (history || []).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        // Prepend system context only if this is the first message (no history)
        let userMessage = message;
        if (!history || history.length === 0) {
            const systemContext = `You are a friendly and helpful social media content assistant for Novus Trend. Be warm, conversational, creative, and helpful with content ideas, hashtags, and strategies for Twitter and LinkedIn. Keep responses under 150 words unless asked for detail. Use casual language and occasional emojis. Remember context from previous messages.\n\nUser: `;
            userMessage = systemContext + message;
        }

        const chat = model.startChat({
            history: chatHistory,
            generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.9, // More creative and conversational
            },
        });

        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        const text = response.text();

        res.json({ text });


    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: 'Failed to generate response', details: error.message });
    }
});

module.exports = router;
