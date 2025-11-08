import { Router, Response } from 'express';
import { RiskFlag } from '../models/RiskFlag';
import { Message } from '../models/Message';
import { User } from '../models/User';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { USER_ROLES, FLAG_STATUS } from '@talkitout/lib';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /risk/flags - Get risk flags (counselor/admin only)
 */
router.get(
  '/flags',
  authenticate,
  authorize(USER_ROLES.COUNSELOR, USER_ROLES.ADMIN),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { status, severity, userId } = req.query;
      const query: any = {};

      if (status) query.status = status;
      if (severity) query.severity = parseInt(severity as string);
      if (userId) query.userId = userId;

      const flags = await RiskFlag.find(query)
        .populate('userId', 'name email age school')
        .populate('messageId', 'text createdAt')
        .sort({ severity: -1, createdAt: -1 })
        .limit(100);

      res.json({ flags });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /risk/flags/:id - Get a single risk flag
 */
router.get(
  '/flags/:id',
  authenticate,
  authorize(USER_ROLES.COUNSELOR, USER_ROLES.ADMIN),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const flag = await RiskFlag.findById(req.params.id)
        .populate('userId', 'name email age school')
        .populate('messageId', 'text createdAt');

      if (!flag) {
        throw new AppError(404, 'Risk flag not found');
      }

      // Get context messages (before and after)
      const contextMessages = await Message.find({
        userId: flag.userId,
        createdAt: {
          $gte: new Date(flag.createdAt.getTime() - 60 * 60 * 1000), // 1 hour before
          $lte: new Date(flag.createdAt.getTime() + 60 * 60 * 1000), // 1 hour after
        },
      }).sort({ createdAt: 1 });

      res.json({
        flag,
        context: contextMessages,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /risk/flags/:id - Update risk flag status
 */
router.patch(
  '/flags/:id',
  authenticate,
  authorize(USER_ROLES.COUNSELOR, USER_ROLES.ADMIN),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { status, notes } = req.body;

      const update: any = {};
      if (status) {
        update.status = status;
        if (status === FLAG_STATUS.RESOLVED) {
          update.resolvedAt = new Date();
        }
      }
      if (notes !== undefined) update.notes = notes;
      if (req.userId) update.reviewedBy = req.userId;

      const flag = await RiskFlag.findByIdAndUpdate(req.params.id, { $set: update }, { new: true })
        .populate('userId', 'name email age school')
        .populate('reviewedBy', 'name');

      if (!flag) {
        throw new AppError(404, 'Risk flag not found');
      }

      res.json(flag);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /risk/flags/:id - Delete a risk flag
 */
router.delete(
  '/flags/:id',
  authenticate,
  authorize(USER_ROLES.COUNSELOR, USER_ROLES.ADMIN),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const flag = await RiskFlag.findByIdAndDelete(req.params.id);

      if (!flag) {
        throw new AppError(404, 'Risk flag not found');
      }

      res.json({ message: 'Risk flag deleted successfully', flag });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
