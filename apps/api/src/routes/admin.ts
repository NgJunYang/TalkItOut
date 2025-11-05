import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { USER_ROLES } from '@talkitout/lib';

const router = Router();

/**
 * GET /admin/health - Health check endpoint
 */
router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  };

  res.json(health);
});

/**
 * GET /admin/config/public - Get public configuration
 */
router.get('/config/public', (req, res) => {
  res.json({
    environment: process.env.NODE_ENV || 'development',
    apiVersion: '1.0.0',
    features: {
      chat: true,
      pomodoro: true,
      checkIns: true,
      tasks: true,
      riskDetection: true,
    },
    crisis: {
      emergency: process.env.CRISIS_EMERGENCY || '999',
      sosLine: process.env.CRISIS_SOS_LINE || '1767',
      sosText: process.env.CRISIS_SOS_TEXT || '9151 1767',
    },
  });
});

/**
 * GET /admin/stats - System statistics (admin only)
 */
router.get(
  '/stats',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const collections = await mongoose.connection.db.collections();
      const stats = await Promise.all(
        collections.map(async (col) => ({
          name: col.collectionName,
          count: await col.countDocuments(),
        }))
      );

      res.json({
        database: mongoose.connection.db.databaseName,
        collections: stats,
        memoryUsage: process.memoryUsage(),
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
