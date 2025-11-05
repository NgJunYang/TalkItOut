import mongoose, { Schema, Document } from 'mongoose';
import { Sentiment, SENTIMENT } from '@talkitout/lib';

export interface ICheckIn extends Document {
  userId: mongoose.Types.ObjectId;
  mood: number;
  note?: string;
  sentiment?: Sentiment;
  createdAt: Date;
}

const CheckInSchema = new Schema<ICheckIn>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    mood: { type: Number, required: true, min: 1, max: 5 },
    note: { type: String },
    sentiment: {
      type: String,
      enum: Object.values(SENTIMENT),
    },
  },
  { timestamps: true }
);

CheckInSchema.index({ userId: 1, createdAt: -1 });

export const CheckIn = mongoose.model<ICheckIn>('CheckIn', CheckInSchema);
