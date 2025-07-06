import OpenAI from 'openai';
import fs from 'fs';

// Read .env file
const envContent = fs.readFileSync('.env', 'utf8');
const apiKey = envContent.match(/VITE_OPENAI_API_KEY=(.+)/)?.[1];

const openai = new OpenAI({
  apiKey: apiKey,
});

async function testAPI() {
  try {
    console.log('Testing OpenAI API...');
    console.log('API Key (first 10 chars):', apiKey?.substring(0, 10) + '...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 10
    });
    
    console.log('API test successful!');
    console.log('Response:', completion.choices[0].message.content);
  } catch (error) {
    console.error('API test failed:', error);
    console.error('Error details:', error.message);
  }
}

testAPI(); 