import mongoose, { Schema, Document } from 'mongoose';
import { RiskSeverity, FlagStatus, FLAG_STATUS } from '@talkitout/lib';

export interface IRiskFlag extends Document {
  userId: mongoose.Types.ObjectId;
  messageId: mongoose.Types.ObjectId;
  tags: string[];
  severity: RiskSeverity;
  status: FlagStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  notes?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RiskFlagSchema = new Schema<IRiskFlag>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    messageId: { type: Schema.Types.ObjectId, ref: 'Message', required: true },
    tags: [{ type: String, required: true }],
    severity: { type: Number, required: true, min: 1, max: 3 },
    status: {
      type: String,
      enum: Object.values(FLAG_STATUS),
      default: FLAG_STATUS.OPEN,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

RiskFlagSchema.index({ userId: 1, status: 1 });
RiskFlagSchema.index({ severity: -1, createdAt: -1 });

export const RiskFlag = mongoose.model<IRiskFlag>('RiskFlag', RiskFlagSchema);
