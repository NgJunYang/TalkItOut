import { Router, Response } from 'express';
import { Session } from '../models/Session';
import { Profile } from '../models/Profile';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * POST /pomodoro/start - Start a Pomodoro session
 */
router.post('/start', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    // Check if there's an active session
    const activeSession = await Session.findOne({
      userId: req.userId,
      endedAt: null,
    });

    if (activeSession) {
      throw new AppError(400, 'Session already in progress');
    }

    const session = await Session.create({
      userId: req.userId,
      type: 'pomodoro',
      startedAt: new Date(),
      cyclesCompleted: 0,
    });

    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /pomodoro/stop - Stop the current Pomodoro session
 */
router.post('/stop', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { cyclesCompleted } = req.body;

    const session = await Session.findOneAndUpdate(
      {
        userId: req.userId,
        endedAt: null,
      },
      {
        $set: {
          endedAt: new Date(),
          cyclesCompleted: cyclesCompleted || 0,
        },
      },
      { new: true }
    );

    if (!session) {
      throw new AppError(404, 'No active session found');
    }

    // Update focus streak if cycles completed
    if (cyclesCompleted > 0) {
      const profile = await Profile.findOne({ userId: req.userId });
      if (profile) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const streakIndex = profile.streaks.findIndex((s) => s.type === 'focus');

        if (streakIndex === -1) {
          profile.streaks.push({
            type: 'focus',
            count: 1,
            lastDate: new Date(),
          });
        } else {
          const lastDate = new Date(profile.streaks[streakIndex].lastDate);
          lastDate.setHours(0, 0, 0, 0);

          const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

          if (daysDiff === 1) {
            profile.streaks[streakIndex].count += 1;
            profile.streaks[streakIndex].lastDate = new Date();
          } else if (daysDiff > 1) {
            profile.streaks[streakIndex].count = 1;
            profile.streaks[streakIndex].lastDate = new Date();
          }
        }

        await profile.save();
      }
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /pomodoro/state - Get current Pomodoro state
 */
router.get('/state', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const activeSession = await Session.findOne({
      userId: req.userId,
      endedAt: null,
    });

    const profile = await Profile.findOne({ userId: req.userId });
    const preferences = profile?.preferences.pomodoro;

    res.json({
      activeSession: activeSession || null,
      preferences: preferences || null,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /pomodoro/history - Get Pomodoro session history
 */
router.get('/history', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { days } = req.query;
    const query: any = { userId: req.userId, endedAt: { $ne: null } };

    if (days) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days as string));
      query.startedAt = { $gte: daysAgo };
    }

    const sessions = await Session.find(query).sort({ startedAt: -1 }).limit(50);

    res.json({ sessions });
  } catch (error) {
    next(error);
  }
});

export default router;
