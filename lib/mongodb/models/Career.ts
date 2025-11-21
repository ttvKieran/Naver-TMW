import mongoose, { Schema, Model } from 'mongoose';

export interface ICareer {
  careerId: string;
  title: string;
  category: string;
  
  // Overview
  description: string;
  overview: {
    salaryRange: {
      min: number;
      max: number;
      currency: string;
      level: 'entry' | 'mid' | 'senior';
    };
    jobGrowth: string;
    difficulty: string;
    timeToProficiency: string;
  };
  
  // Requirements (References to Skills collection)
  requiredSkills: Array<{
    skillId: mongoose.Types.ObjectId;
    importanceLevel: 'essential' | 'highly-recommended' | 'recommended' | 'optional';
    minimumProficiency: number; // 1-10 scale
    category: 'technical' | 'soft-skill' | 'language' | 'tool';
  }>;
  
  certifications?: string[];
  education: {
    minimumDegree?: string;
    preferredMajors?: string[];
  };
  
  // Note: Roadmap is now a separate collection (Roadmap model)
  // that references this Career via careerId
  
  // Job Market
  companies?: string[];
  relatedCareers?: string[];
  
  // Matching Criteria
  idealProfile?: {
    personalityTypes?: string[];
    topSkills?: string[];
    minGPA?: number;
    traits?: {
      analytical?: number;
      creative?: number;
      teamwork?: number;
      leadership?: number;
      technical?: number;
    };
  };
  
  // Metadata
  isActive: boolean;
  popularity: number;
  createdAt: Date;
  updatedAt: Date;
  lastReviewed?: Date;
}

const CareerSchema = new Schema<ICareer>(
  {
    careerId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    
    description: {
      type: String,
      required: true,
    },
    
    overview: {
      salaryRange: {
        min: Number,
        max: Number,
        currency: { type: String, default: 'VND' },
        level: {
          type: String,
          enum: ['entry', 'mid', 'senior'],
          default: 'entry',
        },
      },
      jobGrowth: String,
      difficulty: String,
      timeToProficiency: String,
    },
    
    // Required Skills (References)
    requiredSkills: [
      {
        skillId: {
          type: Schema.Types.ObjectId,
          ref: 'Skill',
          required: true,
        },
        importanceLevel: {
          type: String,
          enum: ['essential', 'highly-recommended', 'recommended', 'optional'],
          default: 'recommended',
        },
        minimumProficiency: {
          type: Number,
          min: 1,
          max: 10,
          required: true,
        },
        category: {
          type: String,
          enum: ['technical', 'soft-skill', 'language', 'tool'],
          required: true,
        },
      },
    ],
    
    certifications: [String],
    education: {
      minimumDegree: String,
      preferredMajors: [String],
    },
    
    // Roadmap is in separate Roadmap collection
    
    companies: [String],
    relatedCareers: [String],
    
    idealProfile: {
      personalityTypes: [String],
      topSkills: [String],
      minGPA: Number,
      traits: {
        analytical: Number,
        creative: Number,
        teamwork: Number,
        leadership: Number,
        technical: Number,
      },
    },
    
    isActive: {
      type: Boolean,
      default: true,
    },
    popularity: {
      type: Number,
      default: 0,
    },
    lastReviewed: Date,
  },
  {
    timestamps: true,
  }
);

export const Career: Model<ICareer> = mongoose.models.Career || mongoose.model<ICareer>('Career', CareerSchema);
