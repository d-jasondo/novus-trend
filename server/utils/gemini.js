const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const LOG_FILE = path.join(__dirname, '..', 'error.log');

async function generateContent(prompt) {
  try {
    // Use gemini-2.0-flash as found in available models list
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    const msg = `[Gemini Error] ${new Date().toISOString()}: ${error.message}\n${JSON.stringify(error, null, 2)}\n`;
    try {
      fs.appendFileSync(LOG_FILE, msg);
    } catch (e) { console.error("Failed to write to log", e); }
    throw error;
  }
}

async function generateCaptionFromImage(imageBase64, mimeType = 'image/jpeg') {
  try {
    // Use gemini-2.0-flash with vision capabilities
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Analyze this image and create an engaging, creative tweet about it. 
The tweet should:
- Be under 280 characters
- Include 2-4 relevant hashtags
- Be attention-grabbing and encourage engagement
- Match the tone and subject of the image (professional for business, casual for fun, etc.)

Generate ONLY the tweet text, no explanations.`;

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    const msg = `[Gemini Vision Error] ${new Date().toISOString()}: ${error.message}\n${JSON.stringify(error, null, 2)}\n`;
    try {
      fs.appendFileSync(LOG_FILE, msg);
    } catch (e) { console.error("Failed to write to log", e); }
    throw error;
  }
}

module.exports = { generateContent, generateCaptionFromImage };
