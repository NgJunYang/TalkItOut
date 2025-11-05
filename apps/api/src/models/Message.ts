import mongoose, { Schema, Document } from 'mongoose';
import { MessageRole, Sentiment, RiskSeverity, MESSAGE_ROLE, SENTIMENT } from '@talkitout/lib';

export interface IMessage extends Document {
  userId: mongoose.Types.ObjectId;
  role: MessageRole;
  text: string;
  sentiment?: Sentiment;
  riskTags: string[];
  severity?: RiskSeverity;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: {
      type: String,
      enum: Object.values(MESSAGE_ROLE),
      required: true,
    },
    text: { type: String, required: true },
    sentiment: {
      type: String,
      enum: Object.values(SENTIMENT),
    },
    riskTags: [{ type: String }],
    severity: { type: Number, min: 1, max: 3 },
  },
  { timestamps: true }
);

MessageSchema.index({ userId: 1, createdAt: -1 });
MessageSchema.index({ severity: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
