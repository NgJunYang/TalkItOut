import mongoose, { Schema, Document } from 'mongoose';
import { DEFAULT_POMODORO } from '@talkitout/lib';

export interface IGoal {
  title: string;
  why?: string;
  firstStep?: string;
  blockers?: string;
  dueAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface IStreak {
  type: 'checkin' | 'focus';
  count: number;
  lastDate: Date;
}

export interface IBadge {
  id: string;
  name: string;
  description: string;
  earnedAt: Date;
}

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  preferences: {
    pomodoro: {
      focusDuration: number;
      breakDuration: number;
      longBreakDuration: number;
      cyclesBeforeLongBreak: number;
    };
    notifications: boolean;
  };
  goals: IGoal[];
  streaks: IStreak[];
  badges: IBadge[];
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    preferences: {
      pomodoro: {
        focusDuration: { type: Number, default: DEFAULT_POMODORO.focusDuration },
        breakDuration: { type: Number, default: DEFAULT_POMODORO.breakDuration },
        longBreakDuration: { type: Number, default: DEFAULT_POMODORO.longBreakDuration },
        cyclesBeforeLongBreak: { type: Number, default: DEFAULT_POMODORO.cyclesBeforeLongBreak },
      },
      notifications: { type: Boolean, default: true },
    },
    goals: [
      {
        title: { type: String, required: true },
        why: String,
        firstStep: String,
        blockers: String,
        dueAt: Date,
        completedAt: Date,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    streaks: [
      {
        type: { type: String, enum: ['checkin', 'focus'], required: true },
        count: { type: Number, default: 0 },
        lastDate: { type: Date, required: true },
      },
    ],
    badges: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String, required: true },
        earnedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

ProfileSchema.index({ userId: 1 });

export const Profile = mongoose.model<IProfile>('Profile', ProfileSchema);
