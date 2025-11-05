import mongoose, { Schema, Document } from 'mongoose';
import { TaskPriority, TaskStatus, TASK_PRIORITY, TASK_STATUS } from '@talkitout/lib';

export interface ITask extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  subject?: string;
  dueAt?: Date;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    subject: { type: String },
    dueAt: { type: Date },
    priority: {
      type: String,
      enum: Object.values(TASK_PRIORITY),
      default: TASK_PRIORITY.MED,
    },
    status: {
      type: String,
      enum: Object.values(TASK_STATUS),
      default: TASK_STATUS.TODO,
    },
  },
  { timestamps: true }
);

TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, dueAt: 1 });

export const Task = mongoose.model<ITask>('Task', TaskSchema);
