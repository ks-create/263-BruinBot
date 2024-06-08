const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, '..', 'Client'))); // Adjust path to serve static files
app.use(express.json());

const openaiApiKey = process.env.OPENAI_API_KEY;
const friendsOpenaiApiKey = process.env.FRIENDS_OPENAI_API_KEY; // New API key

if (!openaiApiKey || !friendsOpenaiApiKey) {
    console.error('ERROR: One or more OpenAI API keys are not set. Please check your .env file.');
    process.exit(1); // Exit the process if API keys are not set
}

const chatbot_persona = {
    name: "BruinBot",
    style: "friendly and enthusiastic",
    background: "knowledgeable about all things UCLA"
};

const system_persona = `As a ${chatbot_persona['style']} UCLA chatbot assistant named ${chatbot_persona['name']}, you are ${chatbot_persona['background']}. You should help the incoming freshmen answer questions about the school.`;

app.post('/get-response', async (req, res) => {
    const userMessage = req.body.message;
    console.log('Received message from client:', userMessage);
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "ft:gpt-3.5-turbo-0125:personal::9WHOcy38",
            messages: [
                { role: "system", content: system_persona },
                { role: "user", content: userMessage }
            ],
            max_tokens: 220
        }, {
            headers: {
                'Authorization': `Bearer ${friendsOpenaiApiKey}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Response from OpenAI:', response.data);
        res.json({ message: response.data.choices[0].message.content.trim() });
    } catch (error) {
        console.error('Error calling OpenAI:', error.response ? error.response.data : error.message);
        res.status(500).send('Failed to fetch response from OpenAI');
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'Client', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
