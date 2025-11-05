import { Router, Response } from 'express';
import { CheckIn } from '../models/CheckIn';
import { Profile } from '../models/Profile';
import { checkInSchema } from '@talkitout/lib';
import { validateBody } from '../middleware/validation';
import { authenticate, AuthRequest } from '../middleware/auth';
import { analyzeText } from '../services/ai/openaiService';

const router = Router();

/**
 * POST /checkins - Create a check-in
 */
router.post(
  '/',
  authenticate,
  validateBody(checkInSchema),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { mood, note } = req.body;

      let sentiment;
      if (note) {
        const analysis = await analyzeText(note);
        sentiment = analysis.sentiment;
      }

      const checkIn = await CheckIn.create({
        userId: req.userId,
        mood,
        note,
        sentiment,
      });

      // Update streak
      const profile = await Profile.findOne({ userId: req.userId });
      if (profile) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const streakIndex = profile.streaks.findIndex((s) => s.type === 'checkin');

        if (streakIndex === -1) {
          // Create new streak
          profile.streaks.push({
            type: 'checkin',
            count: 1,
            lastDate: new Date(),
          });
        } else {
          const lastDate = new Date(profile.streaks[streakIndex].lastDate);
          lastDate.setHours(0, 0, 0, 0);

          const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

          if (daysDiff === 1) {
            // Continue streak
            profile.streaks[streakIndex].count += 1;
            profile.streaks[streakIndex].lastDate = new Date();
          } else if (daysDiff > 1) {
            // Reset streak
            profile.streaks[streakIndex].count = 1;
            profile.streaks[streakIndex].lastDate = new Date();
          }
          // If daysDiff === 0, already checked in today, don't update
        }

        await profile.save();
      }

      res.status(201).json(checkIn);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /checkins/me - Get current user's check-ins
 */
router.get('/me', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { days } = req.query;
    const query: any = { userId: req.userId };

    if (days) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days as string));
      query.createdAt = { $gte: daysAgo };
    }

    const checkIns = await CheckIn.find(query).sort({ createdAt: -1 }).limit(100);

    res.json({ checkIns });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /checkins/stats - Get check-in statistics
 */
router.get('/stats', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCheckIns = await CheckIn.find({
      userId: req.userId,
      createdAt: { $gte: sevenDaysAgo },
    });

    const avgMood = recentCheckIns.length > 0
      ? recentCheckIns.reduce((sum, c) => sum + c.mood, 0) / recentCheckIns.length
      : 0;

    const profile = await Profile.findOne({ userId: req.userId });
    const streak = profile?.streaks.find((s) => s.type === 'checkin');

    res.json({
      totalCheckIns: await CheckIn.countDocuments({ userId: req.userId }),
      recentCheckIns: recentCheckIns.length,
      averageMood: Math.round(avgMood * 10) / 10,
      currentStreak: streak?.count || 0,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
