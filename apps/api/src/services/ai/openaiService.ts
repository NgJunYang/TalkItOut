import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AIClassification,
  aiClassificationSchema,
  ASSISTANT_SYSTEM_PROMPT,
  CLASSIFIER_SYSTEM_PROMPT,
  CRISIS_MESSAGE,
  pseudonymizeText,
  RISK_SEVERITY,
} from '@talkitout/lib';
import { Message } from '../../models/Message';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
const ALLOW_EXTERNAL_PII = process.env.ALLOW_EXTERNAL_PII === 'true';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

/**
 * Analyzes text for sentiment and risk indicators using Gemini
 */
export async function analyzeText(text: string): Promise<AIClassification> {
  try {
    if (!GEMINI_API_KEY) {
      console.warn('No Gemini API key provided, using safe defaults');
      return {
        sentiment: 'neu',
        riskTags: [],
        severity: 1,
      };
    }

    // Pseudonymize before sending to Gemini
    const sanitizedText = pseudonymizeText(text, ALLOW_EXTERNAL_PII);

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `${CLASSIFIER_SYSTEM_PROMPT}\n\nAnalyze this text: "${sanitizedText}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim();

    // Extract JSON from response (Gemini sometimes wraps it in markdown)
    let jsonText = content;
    if (content.includes('```json')) {
      jsonText = content.match(/```json\n([\s\S]*?)\n```/)?.[1] || content;
    } else if (content.includes('```')) {
      jsonText = content.match(/```\n([\s\S]*?)\n```/)?.[1] || content;
    }

    // Parse and validate JSON response
    const parsed = JSON.parse(jsonText);
    const validated = aiClassificationSchema.parse(parsed);

    return validated;
  } catch (error) {
    console.error('Error analyzing text:', error);
    // Return safe defaults on error
    return {
      sentiment: 'neu',
      riskTags: [],
      severity: 1,
    };
  }
}

/**
 * Generates AI response to user message using Gemini
 */
export async function generateResponse(
  userId: string,
  userMessage: string,
  context?: { mood?: number; recentMessages?: number }
): Promise<string> {
  try {
    if (!GEMINI_API_KEY) {
      return "I'm here to help! However, the AI service is not configured. Please contact your administrator.";
    }

    // Get conversation history
    const historyLimit = context?.recentMessages || 10;
    const history = await Message.find({ userId })
      .sort({ createdAt: -1 })
      .limit(historyLimit)
      .lean();

    // Build conversation context
    let conversationHistory = '';
    history.reverse().forEach((msg) => {
      const role = msg.role === 'user' ? 'Student' : 'TalkItOut';
      conversationHistory += `${role}: ${msg.text}\n`;
    });

    // Add current user message
    const sanitizedMessage = pseudonymizeText(userMessage, ALLOW_EXTERNAL_PII);

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `${ASSISTANT_SYSTEM_PROMPT}

Previous conversation:
${conversationHistory}

Student: ${sanitizedMessage}

TalkItOut:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let aiResponse = response.text().trim();

    if (!aiResponse) {
      return "I'm here to help! Can you tell me more about what's on your mind?";
    }

    return aiResponse;
  } catch (error) {
    console.error('Error generating response:', error);
    return "I'm having trouble responding right now. Let's take a moment and try again.";
  }
}

/**
 * Prepends crisis message to response if severity is high
 */
export function addCrisisMessageIfNeeded(response: string, severity: number): string {
  if (severity >= RISK_SEVERITY.HIGH) {
    return `${CRISIS_MESSAGE}\n\n${response}`;
  }
  return response;
}

/**
 * Detects potential AI overreliance based on message patterns
 */
export async function detectOverreliance(userId: string): Promise<boolean> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentMessages = await Message.countDocuments({
    userId,
    role: 'user',
    createdAt: { $gte: oneDayAgo },
  });

  // Flag if user sends more than 30 messages in 24 hours
  if (recentMessages > 30) {
    return true;
  }

  // Check for low mood patterns
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const negativeMessages = await Message.countDocuments({
    userId,
    role: 'user',
    sentiment: 'neg',
    createdAt: { $gte: sevenDaysAgo },
  });

  const totalRecentMessages = await Message.countDocuments({
    userId,
    role: 'user',
    createdAt: { $gte: sevenDaysAgo },
  });

  // Flag if >70% of messages are negative over 7 days
  if (totalRecentMessages > 10 && negativeMessages / totalRecentMessages > 0.7) {
    return true;
  }

  return false;
}
