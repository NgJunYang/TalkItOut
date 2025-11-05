import { Router, Response } from 'express';
import { User } from '../models/User';
import { Profile } from '../models/Profile';
import { updateProfileSchema, goalSchema } from '@talkitout/lib';
import { validateBody } from '../middleware/validation';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { USER_ROLES } from '@talkitout/lib';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /users/me - Get current user profile
 */
router.get('/me', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await User.findById(req.userId).select('-password -refreshTokens');
    const profile = await Profile.findOne({ userId: req.userId });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        school: user.school,
        createdAt: user.createdAt,
      },
      profile: profile || null,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /users/me - Update current user profile
 */
router.patch(
  '/me',
  authenticate,
  validateBody(updateProfileSchema),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { name, school, preferences } = req.body;

      // Update user
      if (name || school !== undefined) {
        await User.findByIdAndUpdate(req.userId, { name, school }, { new: true });
      }

      // Update profile
      if (preferences) {
        await Profile.findOneAndUpdate(
          { userId: req.userId },
          { $set: { preferences } },
          { new: true, upsert: true }
        );
      }

      // Fetch updated data
      const user = await User.findById(req.userId).select('-password -refreshTokens');
      const profile = await Profile.findOne({ userId: req.userId });

      res.json({
        user,
        profile,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /users/me/goals - Add a goal
 */
router.post(
  '/me/goals',
  authenticate,
  validateBody(goalSchema),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const goal = {
        ...req.body,
        createdAt: new Date(),
      };

      const profile = await Profile.findOneAndUpdate(
        { userId: req.userId },
        { $push: { goals: goal } },
        { new: true, upsert: true }
      );

      res.status(201).json(profile.goals[profile.goals.length - 1]);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /users - List users (counselor/admin only)
 */
router.get(
  '/',
  authenticate,
  authorize(USER_ROLES.COUNSELOR, USER_ROLES.ADMIN),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { role, search } = req.query;
      const query: any = {};

      if (role) {
        query.role = role;
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      const users = await User.find(query)
        .select('-password -refreshTokens')
        .sort({ createdAt: -1 })
        .limit(100);

      res.json({ users });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
