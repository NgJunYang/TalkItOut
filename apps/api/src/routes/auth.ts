import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Profile } from '../models/Profile';
import { registerSchema, loginSchema } from '@talkitout/lib';
import { validateBody } from '../middleware/validation';
import { generateTokens, verifyToken, AuthRequest, authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * POST /auth/register - Register a new user
 */
router.post('/register', authLimiter, validateBody(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password, age, school, guardianConsent, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError(409, 'User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      age,
      school,
      guardianConsent,
      role,
    });

    // Create profile
    await Profile.create({
      userId: user._id,
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);

    // Store refresh token
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        school: user.school,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/login - Login user
 */
router.post('/login', authLimiter, validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);

    // Store refresh token
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        school: user.school,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/refresh - Refresh access token
 */
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new AppError(400, 'Refresh token required');
    }

    // Verify refresh token
    const payload = verifyToken(refreshToken);
    if (payload.type !== 'refresh') {
      throw new AppError(401, 'Invalid token type');
    }

    // Check if token exists in database
    const user = await User.findById(payload.userId);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      throw new AppError(401, 'Invalid refresh token');
    }

    // Generate new tokens
    const tokens = generateTokens(user._id.toString(), user.role);

    // Remove old refresh token and add new one
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    res.json(tokens);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/logout - Logout user
 */
router.post('/logout', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      // Remove refresh token from database
      await User.findByIdAndUpdate(req.userId, {
        $pull: { refreshTokens: refreshToken },
      });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
