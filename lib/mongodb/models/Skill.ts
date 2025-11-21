import mongoose, { Schema, Model } from 'mongoose';

// Skill Interface & Schema
export interface ISkill {
  skillId: string;
  name: string;
  category: 'technical' | 'soft-skill' | 'language' | 'tool';
  subcategory?: string;
  
  description?: string;
  
  // Difficulty & Learning
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedLearningTime?: string;
  
  // Related Skills
  prerequisites?: mongoose.Types.ObjectId[];
  relatedSkills?: mongoose.Types.ObjectId[];
  
  // Learning Resources
  learningResources?: Array<{
    title: string;
    url: string;
    type: 'course' | 'documentation' | 'tutorial' | 'book' | 'video';
    isPaid: boolean;
    rating?: number;
    provider?: string;
  }>;
  
  // Career Relevance
  relevantCareers?: mongoose.Types.ObjectId[];
  demandLevel?: 'high' | 'medium' | 'low';
  
  // Metadata
  isActive: boolean;
  popularity: number;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema<ISkill>(
  {
    skillId: {
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
    category: {
      type: String,
      required: true,
      enum: ['technical', 'soft-skill', 'language', 'tool'],
    },
    subcategory: {
      type: String,
      trim: true,
    },
    description: String,
    
    difficulty: {
      type: String,
      required: true,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    },
    estimatedLearningTime: String,
    
    prerequisites: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Skill',
      },
    ],
    relatedSkills: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Skill',
      },
    ],
    
    learningResources: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        type: {
          type: String,
          enum: ['course', 'documentation', 'tutorial', 'book', 'video'],
          required: true,
        },
        isPaid: { type: Boolean, default: false },
        rating: { type: Number, min: 1, max: 5 },
        provider: String,
      },
    ],
    
    relevantCareers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Career',
      },
    ],
    demandLevel: {
      type: String,
      // enum: ['high', 'medium', 'low'],
    },
    
    isActive: {
      type: Boolean,
      default: true,
    },
    popularity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Skill: Model<ISkill> = mongoose.models.Skill || mongoose.model<ISkill>('Skill', SkillSchema);
