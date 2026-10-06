import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  fullName: string;
  username?: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'student' | 'admin';
  department?: string;
  currentSessionId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    username: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
      lowercase: true,
      maxlength: 60,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 120,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 15,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    department: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    currentSessionId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation of model during hot reloads
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
