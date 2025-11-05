import { Router, Response } from 'express';
import { Task } from '../models/Task';
import { createTaskSchema, updateTaskSchema } from '@talkitout/lib';
import { validateBody } from '../middleware/validation';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * POST /tasks - Create a task
 */
router.post(
  '/',
  authenticate,
  validateBody(createTaskSchema),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const task = await Task.create({
        userId: req.userId,
        ...req.body,
      });

      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /tasks - Get user's tasks
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { status, priority, subject } = req.query;
    const query: any = { userId: req.userId };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (subject) query.subject = subject;

    const tasks = await Task.find(query).sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /tasks/:id - Get a single task
 */
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /tasks/:id - Update a task
 */
router.patch(
  '/:id',
  authenticate,
  validateBody(updateTaskSchema),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const task = await Task.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!task) {
        throw new AppError(404, 'Task not found');
      }

      res.json(task);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /tasks/:id - Delete a task
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /tasks/:id/status - Update task status
 */
router.patch('/:id/status', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      throw new AppError(400, 'Status is required');
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: { status } },
      { new: true, runValidators: true }
    );

    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
});

export default router;
