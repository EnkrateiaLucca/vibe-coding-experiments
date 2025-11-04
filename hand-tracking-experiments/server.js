const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Ollama } = require('ollama');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

// Check if config file exists
let config = {
  openai_api_key: process.env.OPENAI_API_KEY || '',
  anthropic_api_key: process.env.ANTHROPIC_API_KEY || '',
  ollama_host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434'
};

const configPath = path.join(__dirname, 'config.json');
if (fs.existsSync(configPath)) {
  try {
    const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config = { ...config, ...fileConfig };
  } catch (error) {
    console.warn('Error reading config file:', error);
  }
}

// Initialize API clients
const ollama = new Ollama({
  host: config.ollama_host
});

const openai = new OpenAI({
  apiKey: config.openai_api_key
});

// Map frontend model IDs to Ollama model names
const OLLAMA_MODEL_MAP = {
  'llama3.2': 'llama3.2',  // or whatever your llama 3.2 tag is in Ollama
  'gemma3': 'gemma3',  // assuming your Gemma model is tagged as 'gemma:7b'
};

app.use(cors());
app.use(express.static(__dirname));
app.use(bodyParser.json());

// Original summarize endpoint for compatibility with llama3_prototype.html
app.post('/summarize', async (req, res) => {
  const { text, systemMessage, action, model } = req.body;
  
  // Get the correct model name from the map, or default to llama3
  const modelName = OLLAMA_MODEL_MAP[model] || 'llama3.2';

  try {
    console.log(`Using model: ${modelName} for action: ${action}`);
    
    const messages = [
      { role: 'system', content: systemMessage },
      { role: 'user', content: text }
    ];
    
    const response = await ollama.chat({
      model: modelName,
      messages
    });
    
    let summary = response.message.content.trim();
    
    if (action === 'bulletPoints') {
      summary = summary.split('.').map(sentence => sentence.trim() ? `• ${sentence.trim()}` : '').filter(Boolean).join('\n');
    } else if (action === 'quizMe') {
      const lines = summary.split('\n').filter(Boolean);
      summary = lines.slice(0, 3).map((q, i) => `${i + 1}. ${q}`).join('\n');
    }
    
    res.json({ summary });
  } catch (error) {
    console.error(`Error with model ${modelName}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// New endpoint for OpenAI API completions
app.post('/api/openai-complete', async (req, res) => {
  const { model, userPrompt, systemPrompt } = req.body;

  if (!config.openai_api_key) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    res.json({ response: response.choices[0].message.content });
  } catch (error) {
    console.error('Error with OpenAI API:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint for Anthropic API completions
app.post('/api/anthropic-complete', async (req, res) => {
  const { model, userPrompt, systemPrompt } = req.body;

  if (!config.anthropic_api_key) {
    return res.status(500).json({ error: 'Anthropic API key not configured' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.anthropic_api_key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to get response from Anthropic API');
    }

    const data = await response.json();
    res.json({ response: data.content[0].text });
  } catch (error) {
    console.error('Error with Anthropic API:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint for Ollama API completions
app.post('/api/ollama-complete', async (req, res) => {
  const { model, text, systemMessage } = req.body;
  
  const modelName = OLLAMA_MODEL_MAP[model] || model;

  try {
    console.log(`Using Ollama model: ${modelName}`);
    
    const messages = [
      { role: 'system', content: systemMessage },
      { role: 'user', content: text }
    ];
    
    const response = await ollama.chat({
      model: modelName,
      messages
    });
    
    res.json({ response: response.message.content.trim() });
  } catch (error) {
    console.error(`Error with Ollama model ${modelName}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to get models status
app.get('/api/models/status', async (req, res) => {
  const status = {
    openai: {
      available: !!config.openai_api_key,
      models: ['gpt-4o']
    },
    anthropic: {
      available: !!config.anthropic_api_key,
      models: ['claude-3-sonnet-20240229']
    },
    ollama: {
      available: true,
      models: []
    }
  };

  // Try to get list of models from Ollama
  try {
    const ollamaModels = await ollama.list();
    status.ollama.models = ollamaModels.models.map(model => model.name);
  } catch (error) {
    console.error('Error getting models from Ollama:', error);
    status.ollama.available = false;
  }

  res.json(status);
});

// Create a config.json template if it doesn't exist
if (!fs.existsSync(configPath)) {
  const configTemplate = {
    openai_api_key: "your_openai_api_key_here",
    anthropic_api_key: "your_anthropic_api_key_here",
    ollama_host: "http://127.0.0.1:11434"
  };
  
  try {
    fs.writeFileSync(configPath, JSON.stringify(configTemplate, null, 2));
    console.log('Created config.json template. Please edit it with your API keys.');
  } catch (error) {
    console.error('Error creating config template:', error);
  }
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`- OpenAI API: ${config.openai_api_key ? 'Configured' : 'Not configured'}`);
  console.log(`- Anthropic API: ${config.anthropic_api_key ? 'Configured' : 'Not configured'}`);
  console.log(`- Ollama API: Using host ${config.ollama_host}`);
  console.log(`Open http://localhost:${port}/llm-spreadsheet.html to use the application`);
});