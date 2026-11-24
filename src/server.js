
require('dotenv').config();
const express = require('express');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(express.json({ limit: '30kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

app.post('/api/generate', async (req, res) => {
  const {
    prompt,
    type = 'General writing',
    tone = 'Professional',
    length = 'Medium'
  } = req.body || {};

  if (typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Please enter a prompt or topic.' });
  }

  if (prompt.length > 5000) {
    return res.status(400).json({
      error: 'Prompt is too long. Please keep it under 5,000 characters.'
    });
  }

  if (!ai) {
    return res.status(503).json({
      error: 'Gemini is not configured. Add GEMINI_API_KEY to your .env file and restart the server.'
    });
  }

  const allowed = {
    type: ['General writing', 'Email', 'Social media post', 'Product description', 'Summary', 'Creative writing', 'Ideas'],
    tone: ['Professional', 'Friendly', 'Persuasive', 'Creative', 'Concise', 'Casual'],
    length: ['Short', 'Medium', 'Long']
  };

  const safeType = allowed.type.includes(type) ? type : 'General writing';
  const safeTone = allowed.tone.includes(tone) ? tone : 'Professional';
  const safeLength = allowed.length.includes(length) ? length : 'Medium';

  const wordGuide = {
    Short: 'about 80–120 words',
    Medium: 'about 180–300 words',
    Long: 'about 400–600 words'
  };

  const instructions = `Generate ${safeType.toLowerCase()} in a ${safeTone.toLowerCase()} tone.
Target length: ${wordGuide[safeLength]}.
Follow the user's request closely.
Return only the generated text without meta commentary.

User prompt:
${prompt.trim()}`;

  try {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: instructions
    });

    const text = response.text?.trim();

    if (!text) {
      return res.status(502).json({ error: 'Gemini returned an empty response. Try again.' });
    }

    return res.json({ text });
  } catch (error) {
    console.error('Gemini API error:', error.message);
    return res.status(500).json({
      error: 'Gemini generation failed. Check your API key, model availability, or quota.'
    });
  }
});

app.get('/api/health', (_, res) => {
  res.json({ success: true, name: 'AI Text Studio API', status: 'running' });
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => console.log(`AI Text Studio running at http://localhost:${port}`));
