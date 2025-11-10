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

// Validate API key on initialization
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY is not set in environment variables');
} else {
  console.log('Gemini API Key loaded:', GEMINI_API_KEY.substring(0, 10) + '...');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

// Use gemini-2.0-flash-exp which is available in v1beta
const AI_MODEL = process.env.AI_MODEL || 'gemini-2.0-flash-exp';
const ALLOW_EXTERNAL_PII = process.env.ALLOW_EXTERNAL_PII === 'true';
const SHORT_RESPONSE_GUIDELINE =
  'Keep every reply brief—no more than four sentences total. Use compact sentences, focus on one actionable next step, and end with a single gentle follow-up question.';

console.log('AI Configuration:', { model: AI_MODEL, allowPII: ALLOW_EXTERNAL_PII });

/**
 * Analyzes text for sentiment and risk indicators
 */
export async function analyzeText(text: string): Promise<AIClassification> {
  try {
    // Pseudonymize before sending to Gemini
    const sanitizedText = pseudonymizeText(text, ALLOW_EXTERNAL_PII);

    const model = genAI.getGenerativeModel({ model: AI_MODEL });

    const prompt = `${CLASSIFIER_SYSTEM_PROMPT}\n\nUser message: ${sanitizedText}`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1000, // Increased to accommodate thinking tokens in Gemini 2.5
      },
    });

    let content = result.response.text().trim();
    if (!content) {
      console.error('Empty response from Gemini. Finish reason:', result.response.candidates?.[0]?.finishReason);
      throw new Error('Empty response from Gemini');
    }

    // Strip markdown code blocks if present
    content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    // Parse and validate JSON response
    const parsed = JSON.parse(content);
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
 * Generates AI response to user message
 */
export async function generateResponse(
  userId: string,
  userMessage: string,
  context?: { mood?: number; recentMessages?: number; userName?: string }
): Promise<string> {
  try {
    // Get conversation history
    const historyLimit = context?.recentMessages || 10;
    const history = await Message.find({ userId })
      .sort({ createdAt: -1 })
      .limit(historyLimit)
      .lean();

    // Build conversation context with system prompt
    let conversationText = `${ASSISTANT_SYSTEM_PROMPT}`;

    // Add user name if provided
    if (context?.userName) {
      conversationText += ` The student's name is ${context.userName}.`;
    }
    conversationText += ` ${SHORT_RESPONSE_GUIDELINE}\n\n`;

    // Add recent history (oldest to newest)
    history.reverse().forEach((msg) => {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      conversationText += `${role}: ${msg.text}\n\n`;
    });

    // Add current user message
    const sanitizedMessage = pseudonymizeText(userMessage, ALLOW_EXTERNAL_PII);
    conversationText += `User: ${sanitizedMessage}\n\nAssistant:`;

    const model = genAI.getGenerativeModel({ model: AI_MODEL });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: conversationText }] }],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 450,
      },
    });

    let aiResponse = result.response.text().trim();
    if (!aiResponse) {
      return "I'm here to help! Can you tell me more about what's on your mind?";
    }

    return aiResponse;
  } catch (error) {
    console.error('Error generating response:', error);

    // Fallback: Return helpful mock responses based on user message keywords
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm here to support you. How are you feeling today?";
    } else if (lowerMessage.includes('stress') || lowerMessage.includes('anxious')) {
      return "I hear that you're feeling stressed. That's completely understandable. Would you like to talk about what's causing you stress? Sometimes breaking things down can help make them feel more manageable.";
    } else if (lowerMessage.includes('help')) {
      return "I'm here to help! I can assist you with managing your tasks, tracking your mood, or just chat about what's on your mind. What would you like to focus on today?";
    } else if (lowerMessage.includes('homework') || lowerMessage.includes('study')) {
      return "Let's work on your studies together! Would you like help organizing your homework, creating a study schedule, or using the Pomodoro technique to stay focused?";
    } else if (lowerMessage.includes('sad') || lowerMessage.includes('down')) {
      return "I'm sorry you're feeling down. Your feelings are valid, and it's okay to have difficult days. Would you like to talk about what's been bothering you?";
    } else if (lowerMessage.includes('thank')) {
      return "You're very welcome! I'm always here whenever you need support. Is there anything else I can help you with?";
    } else {
      return "I understand. Tell me more about what's on your mind. I'm here to listen and support you.";
    }
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
