import { Router, Response } from 'express';
import { User } from '../models/User';
import { Profile } from '../models/Profile';
import { Task } from '../models/Task';
import { Session } from '../models/Session';
import { CheckIn } from '../models/CheckIn';
import { Message } from '../models/Message';
import { RiskFlag } from '../models/RiskFlag';
import { Audit } from '../models/Audit';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /privacy/export - Export all user data (GDPR/PDPA compliance)
 */
router.get('/export', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.userId;

    // Gather all user data
    const user = await User.findById(userId).select('-password -refreshTokens');
    const profile = await Profile.findOne({ userId });
    const tasks = await Task.find({ userId });
    const sessions = await Session.find({ userId });
    const checkIns = await CheckIn.find({ userId });
    const messages = await Message.find({ userId });
    const riskFlags = await RiskFlag.find({ userId });
    const audits = await Audit.find({ actorId: userId });

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: user?.toObject(),
      profile: profile?.toObject(),
      tasks: tasks.map((t) => t.toObject()),
      sessions: sessions.map((s) => s.toObject()),
      checkIns: checkIns.map((c) => c.toObject()),
      messages: messages.map((m) => m.toObject()),
      riskFlags: riskFlags.map((r) => r.toObject()),
      audits: audits.map((a) => a.toObject()),
    };

    // Log export action
    await Audit.create({
      actorId: userId,
      action: 'data_export',
      entity: 'User',
      entityId: userId,
      timestamp: new Date(),
    });

    res.json(exportData);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /privacy/delete - Request account deletion (GDPR/PDPA compliance)
 */
router.post('/delete', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.userId;
    const { confirmation } = req.body;

    if (confirmation !== 'DELETE') {
      return res.status(400).json({
        error: 'Please confirm deletion by sending { "confirmation": "DELETE" }',
      });
    }

    // Log deletion before removing data
    await Audit.create({
      actorId: userId,
      action: 'account_deletion',
      entity: 'User',
      entityId: userId,
      timestamp: new Date(),
    });

    // Delete all user data
    await Promise.all([
      User.findByIdAndDelete(userId),
      Profile.deleteOne({ userId }),
      Task.deleteMany({ userId }),
      Session.deleteMany({ userId }),
      CheckIn.deleteMany({ userId }),
      Message.deleteMany({ userId }),
      RiskFlag.deleteMany({ userId }),
    ]);

    res.json({
      message: 'Account and all associated data have been permanently deleted',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
