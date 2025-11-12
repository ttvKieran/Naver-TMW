import mongoose, { Schema, Model } from 'mongoose';

// Course Interface & Schema
export interface ICourse {
  courseId: string;
  name: string;
  shortName?: string;
  
  // Course Info
  description?: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
  
  // Provider
  provider: string;
  instructors?: string[];
  platform?: 'online' | 'in-person' | 'hybrid';
  
  // Duration & Effort
  duration?: string;
  estimatedHours?: number;
  weeklyCommitment?: string;
  
  // Prerequisites
  prerequisites?: Array<{
    type: 'course' | 'skill';
    referenceId: mongoose.Types.ObjectId;
    isRequired: boolean;
  }>;
  
  // Skills Taught
  skillsCovered: Array<{
    skillId: mongoose.Types.ObjectId;
    proficiencyGained: number;
    isCoreSkill: boolean;
  }>;
  
  // Access & Cost
  accessType: 'free' | 'paid' | 'freemium' | 'subscription';
  cost?: {
    amount?: number;
    currency?: string;
    billingCycle?: 'one-time' | 'monthly' | 'yearly';
  };
  url?: string;
  
  // Quality Metrics
  rating?: number;
  reviewCount?: number;
  completionRate?: number;
  enrollmentCount?: number;
  
  // Career Relevance
  relevantCareers?: mongoose.Types.ObjectId[];
  
  // Certificate
  providesCertificate: boolean;
  certificateType?: 'completion' | 'verified' | 'professional';
  
  // Metadata
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastReviewed?: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    courseId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    shortName: {
      type: String,
      trim: true,
    },
    
    description: String,
    category: {
      type: String,
      // required: true,
    },
    level: {
      type: String,
      required: true,
      enum: ['beginner', 'intermediate', 'advanced'],
    },
    language: String,
    
    provider: {
      type: String,
      required: true,
    },
    instructors: [String],
    platform: {
      type: String,
      enum: ['online', 'in-person', 'hybrid'],
    },
    
    duration: String,
    estimatedHours: Number,
    weeklyCommitment: String,
    
    prerequisites: [
      {
        type: {
          type: String,
          enum: ['course', 'skill'],
          required: true,
        },
        referenceId: {
          type: Schema.Types.ObjectId,
          required: true,
          refPath: 'prerequisites.type',
        },
        isRequired: {
          type: Boolean,
          default: true,
        },
      },
    ],
    
    skillsCovered: [
      {
        skillId: {
          type: Schema.Types.ObjectId,
          ref: 'Skill',
          required: true,
        },
        proficiencyGained: {
          type: Number,
          min: 1,
          max: 10,
          required: true,
        },
        isCoreSkill: {
          type: Boolean,
          default: true,
        },
      },
    ],
    
    accessType: {
      type: String,
      // required: true,
      enum: ['free', 'paid', 'freemium', 'subscription'],
    },
    cost: {
      amount: Number,
      currency: String,
      billingCycle: {
        type: String,
        enum: ['one-time', 'monthly', 'yearly'],
      },
    },
    url: String,
    
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    reviewCount: Number,
    completionRate: Number,
    enrollmentCount: Number,
    
    relevantCareers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Career',
      },
    ],
    
    providesCertificate: {
      type: Boolean,
      default: false,
    },
    certificateType: {
      type: String,
      enum: ['completion', 'verified', 'professional'],
    },
    
    isActive: {
      type: Boolean,
      default: true,
    },
    lastReviewed: Date,
  },
  {
    timestamps: true,
  }
);


export const Course: Model<ICourse> = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
