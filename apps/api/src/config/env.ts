import dotenv from 'dotenv';
import path from 'path';

// Load .env file from the api directory
const envPath = path.resolve(process.cwd(), '.env');
const result = dotenv.config({ path: envPath, override: true });

if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('✓ .env file loaded successfully');
}

// Debug: Log if GEMINI_API_KEY is loaded
console.log('Environment check:', {
  hasGeminiKey: !!process.env.GEMINI_API_KEY,
  keyPreview: process.env.GEMINI_API_KEY?.substring(0, 10) + '...' || 'NOT SET',
  nodeEnv: process.env.NODE_ENV,
});
