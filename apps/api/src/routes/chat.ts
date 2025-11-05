import { Router, Response } from 'express';
import { Message } from '../models/Message';
import { RiskFlag } from '../models/RiskFlag';
import { chatMessageSchema } from '@talkitout/lib';
import { validateBody } from '../middleware/validation';
import { authenticate, AuthRequest } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';
import { analyzeText, generateResponse, addCrisisMessageIfNeeded } from '../services/ai/openaiService';
import { RISK_SEVERITY } from '@talkitout/lib';

const router = Router();

/**
 * POST /chat/message - Send a message and get AI response
 */
router.post(
  '/message',
  authenticate,
  aiLimiter,
  validateBody(chatMessageSchema),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { text } = req.body;

      // Analyze user message
      const analysis = await analyzeText(text);

      // Save user message
      const userMessage = await Message.create({
        userId: req.userId,
        role: 'user',
        text,
        sentiment: analysis.sentiment,
        riskTags: analysis.riskTags,
        severity: analysis.severity,
      });

      // Create risk flag if severity is medium or high
      if (analysis.severity >= RISK_SEVERITY.MEDIUM && analysis.riskTags.length > 0) {
        await RiskFlag.create({
          userId: req.userId,
          messageId: userMessage._id,
          tags: analysis.riskTags,
          severity: analysis.severity,
          status: 'open',
        });
      }

      // Generate AI response
      let aiResponseText = await generateResponse(req.userId!, text);

      // Add crisis message if needed
      aiResponseText = addCrisisMessageIfNeeded(aiResponseText, analysis.severity);

      // Save AI message
      const aiMessage = await Message.create({
        userId: req.userId,
        role: 'assistant',
        text: aiResponseText,
      });

      res.json({
        userMessage: {
          id: userMessage._id,
          text: userMessage.text,
          sentiment: userMessage.sentiment,
          severity: userMessage.severity,
          createdAt: userMessage.createdAt,
        },
        aiMessage: {
          id: aiMessage._id,
          text: aiMessage.text,
          createdAt: aiMessage.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /chat/history - Get chat history
 */
router.get('/history', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = parseInt(req.query.skip as string) || 0;

    const messages = await Message.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      messages: messages.reverse(), // Return in chronological order
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /chat/history - Clear chat history
 */
router.delete('/history', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    await Message.deleteMany({ userId: req.userId });
    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    next(error);
  }
});

export default router;
