import { Router, Response } from 'express';
import { CounselorMessage } from '../models/CounselorMessage';
import { User } from '../models/User';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { USER_ROLES } from '@talkitout/lib';

const router = Router();

/**
 * POST /counselor-messages - Send a message from counselor to student (counselor/admin only)
 */
router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.COUNSELOR, USER_ROLES.ADMIN),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { toUserId, text } = req.body;

      if (!toUserId || !text) {
        return res.status(400).json({ message: 'toUserId and text are required' });
      }

      if (text.trim().length === 0) {
        return res.status(400).json({ message: 'Message text cannot be empty' });
      }

      // Verify the recipient is a student
      const student = await User.findById(toUserId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      if (student.role !== USER_ROLES.STUDENT) {
        return res.status(400).json({ message: 'Messages can only be sent to students' });
      }

      // Create the message
      const message = await CounselorMessage.create({
        fromUserId: req.userId,
        toUserId,
        text: text.trim(),
        read: false,
      });

      // Populate the sender info before sending response
      await message.populate('fromUserId', 'name email role');

      res.status(201).json({
        message: 'Message sent successfully',
        counselorMessage: message,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /counselor-messages/received - Get messages received by the current user (student only)
 */
router.get(
  '/received',
  authenticate,
  async (req: AuthRequest, res: Response, next) => {
    try {
      const messages = await CounselorMessage.find({ toUserId: req.userId })
        .populate('fromUserId', 'name email role')
        .sort({ createdAt: -1 })
        .lean();

      res.json({ messages });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /counselor-messages/:id/read - Mark a message as read (student only)
 */
router.patch(
  '/:id/read',
  authenticate,
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { id } = req.params;

      const message = await CounselorMessage.findById(id);

      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }

      // Verify the message is for this user
      if (message.toUserId.toString() !== req.userId) {
        return res.status(403).json({ message: 'Not authorized to update this message' });
      }

      message.read = true;
      await message.save();

      res.json({ message: 'Message marked as read', counselorMessage: message });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /counselor-messages/sent - Get messages sent by the current counselor (counselor/admin only)
 */
router.get(
  '/sent',
  authenticate,
  authorize(USER_ROLES.COUNSELOR, USER_ROLES.ADMIN),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { toUserId } = req.query;

      const query: any = { fromUserId: req.userId };
      if (toUserId) {
        query.toUserId = toUserId;
      }

      const messages = await CounselorMessage.find(query)
        .populate('toUserId', 'name email role')
        .sort({ createdAt: -1 })
        .lean();

      res.json({ messages });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /counselor-messages/unread-count - Get count of unread messages for current user
 */
router.get(
  '/unread-count',
  authenticate,
  async (req: AuthRequest, res: Response, next) => {
    try {
      const count = await CounselorMessage.countDocuments({
        toUserId: req.userId,
        read: false,
      });

      res.json({ count });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /counselor-messages/:id/reply - Reply to a message (student replies to counselor)
 */
router.post(
  '/:id/reply',
  authenticate,
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { id } = req.params;
      const { text } = req.body;

      if (!text || text.trim().length === 0) {
        return res.status(400).json({ message: 'Reply text is required' });
      }

      // Find the original message
      const originalMessage = await CounselorMessage.findById(id);
      if (!originalMessage) {
        return res.status(404).json({ message: 'Original message not found' });
      }

      // Verify the user is the recipient of the original message
      if (originalMessage.toUserId.toString() !== req.userId) {
        return res.status(403).json({ message: 'Not authorized to reply to this message' });
      }

      // Create the reply (swap from and to)
      const reply = await CounselorMessage.create({
        fromUserId: req.userId, // Student
        toUserId: originalMessage.fromUserId, // Counselor
        text: text.trim(),
        read: false,
        threadId: originalMessage.threadId || originalMessage._id, // Use existing thread or start new one
      });

      // Populate sender info
      await reply.populate('fromUserId', 'name email role');

      res.status(201).json({
        message: 'Reply sent successfully',
        counselorMessage: reply,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /counselor-messages/:id/thread - Get all messages in a conversation thread
 */
router.get(
  '/:id/thread',
  authenticate,
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { id } = req.params;

      // Find the message
      const message = await CounselorMessage.findById(id);
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }

      // Verify the user is part of this conversation
      const isRecipient = message.toUserId.toString() === req.userId;
      const isSender = message.fromUserId.toString() === req.userId;

      if (!isRecipient && !isSender) {
        return res.status(403).json({ message: 'Not authorized to view this thread' });
      }

      // Get the thread ID (either the threadId or the message itself if it's the original)
      const threadId = message.threadId || message._id;

      // Get all messages in this thread
      const threadMessages = await CounselorMessage.find({
        $or: [
          { _id: threadId },
          { threadId: threadId }
        ]
      })
        .populate('fromUserId', 'name email role')
        .populate('toUserId', 'name email role')
        .sort({ createdAt: 1 })
        .lean();

      res.json({ messages: threadMessages });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
