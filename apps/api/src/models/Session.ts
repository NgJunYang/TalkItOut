import mongoose, { Schema, Document } from 'mongoose';
import { SessionType, SESSION_TYPE } from '@talkitout/lib';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  type: SessionType;
  startedAt: Date;
  endedAt?: Date;
  cyclesCompleted: number;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: Object.values(SESSION_TYPE),
      required: true,
    },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date },
    cyclesCompleted: { type: Number, default: 0 },
  },
  { timestamps: true }
);

SessionSchema.index({ userId: 1, startedAt: -1 });

export const Session = mongoose.model<ISession>('Session', SessionSchema);
