import OpenAI from 'openai';
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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';
const ALLOW_EXTERNAL_PII = process.env.ALLOW_EXTERNAL_PII === 'true';

/**
 * Analyzes text for sentiment and risk indicators
 */
export async function analyzeText(text: string): Promise<AIClassification> {
  try {
    // Pseudonymize before sending to OpenAI
    const sanitizedText = pseudonymizeText(text, ALLOW_EXTERNAL_PII);

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: CLASSIFIER_SYSTEM_PROMPT },
        { role: 'user', content: sanitizedText },
      ],
      temperature: 0.3,
      max_tokens: 150,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

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
  context?: { mood?: number; recentMessages?: number }
): Promise<string> {
  try {
    // Get conversation history
    const historyLimit = context?.recentMessages || 10;
    const history = await Message.find({ userId })
      .sort({ createdAt: -1 })
      .limit(historyLimit)
      .lean();

    // Build conversation context
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: ASSISTANT_SYSTEM_PROMPT },
    ];

    // Add recent history (oldest to newest)
    history.reverse().forEach((msg) => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text,
      });
    });

    // Add current user message
    const sanitizedMessage = pseudonymizeText(userMessage, ALLOW_EXTERNAL_PII);
    messages.push({ role: 'user', content: sanitizedMessage });

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    let aiResponse = response.choices[0]?.message?.content?.trim();
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
