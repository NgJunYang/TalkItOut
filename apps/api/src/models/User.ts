import mongoose, { Schema, Document } from 'mongoose';
import { UserRole, USER_ROLES } from '@talkitout/lib';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  role: UserRole;
  name: string;
  email: string;
  password: string;
  age: number;
  school?: string;
  guardianConsent?: boolean;
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.STUDENT,
      required: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    age: { type: Number, required: true },
    school: { type: String },
    guardianConsent: { type: Boolean },
    refreshTokens: [{ type: String }],
  },
  { timestamps: true }
);

// Index for performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
