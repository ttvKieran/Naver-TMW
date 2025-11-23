import mongoose, { Schema, Model } from 'mongoose';

export interface IUser {
  email: string;
  passwordHash: string; // Changed from password to passwordHash
  name: string;
  role: 'student' | 'admin' | 'counselor';
  studentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  emailVerified: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['student', 'admin', 'counselor'],
      default: 'student',
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
    },
    lastLogin: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Clear any cached model to ensure schema updates
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
