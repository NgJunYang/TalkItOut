import mongoose, { Schema, Document } from 'mongoose';

export interface ICounselorMessage extends Document {
  fromUserId: mongoose.Types.ObjectId; // User who sent the message (can be counselor or student)
  toUserId: mongoose.Types.ObjectId; // User who receives the message (can be counselor or student)
  text: string;
  read: boolean;
  threadId?: mongoose.Types.ObjectId; // Reference to the original message to group conversation threads
  createdAt: Date;
  updatedAt: Date;
}

const CounselorMessageSchema = new Schema<ICounselorMessage>(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 5000,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    threadId: {
      type: Schema.Types.ObjectId,
      ref: 'CounselorMessage',
      index: true,
    },
  },
  { timestamps: true }
);

// Index for querying messages for a specific user
CounselorMessageSchema.index({ toUserId: 1, createdAt: -1 });
// Index for unread messages
CounselorMessageSchema.index({ toUserId: 1, read: 1, createdAt: -1 });
// Index for thread conversations
CounselorMessageSchema.index({ threadId: 1, createdAt: 1 });

export const CounselorMessage = mongoose.model<ICounselorMessage>('CounselorMessage', CounselorMessageSchema);
