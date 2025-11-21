import mongoose, { Schema, Model } from 'mongoose';

export interface IRecommendation {
  studentId: mongoose.Types.ObjectId;
  sessionId?: mongoose.Types.ObjectId;
  
  recommendedCareers: Array<{
    careerId: mongoose.Types.ObjectId;
    careerTitle: string;
    matchScore: number; // 0-100
    confidence: 'high' | 'medium' | 'low';
    
    strengths: string[];
    
    // Skill gaps (References to Skills collection)
    skillGaps: Array<{
      skillId: mongoose.Types.ObjectId;
      skillName: string;
      currentLevel: number; // 1-10
      requiredLevel: number; // 1-10
      gap: number; // requiredLevel - currentLevel
      priority: 'critical' | 'high' | 'medium' | 'low';
    }>;
    
    // Recommended courses (References to Courses collection)
    recommendedCourses?: Array<{
      courseId: mongoose.Types.ObjectId;
      reason: string;
      priority: number; // 1 = highest
      skillsAddressed: mongoose.Types.ObjectId[]; // Skills this course helps with
      estimatedImpact: number; // 0-100
    }>;
    
    // Recommended roadmap (Reference to Roadmap collection)
    recommendedRoadmap?: mongoose.Types.ObjectId;
    
    customGuidance?: {
      currentLevel: string;
      estimatedTimeToReady: string;
      nextSteps: string[];
      milestones: Array<{
        title: string;
        duration: string;
        tasks: string[];
        skillsRequired: mongoose.Types.ObjectId[];
        completed: boolean;
      }>;
    };
    
    rank: number;
  }>;
  
  studentSnapshot: {
    gpa?: number;
    skills: Record<string, number>;
    personality: Record<string, any>;
    interests: string[];
    preferences?: Record<string, any>;
  };
  
  aiAnalysis?: {
    overallAssessment: string;
    keyStrengths: string[];
    areasForImprovement: string[];
    careerReadiness: 'ready' | 'needs_preparation' | 'long_term';
    additionalNotes?: string;
  };
  
  engagement?: {
    viewed: boolean;
    viewedAt?: Date;
    acceptedCareer?: string;
    feedback?: {
      rating?: number;
      helpful?: boolean;
      comments?: string;
    };
  };
  
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  version: number;
}

const RecommendationSchema = new Schema<IRecommendation>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatSession',
    },
    
    recommendedCareers: [
      {
        careerId: {
          type: Schema.Types.ObjectId,
          ref: 'Career',
          required: true,
        },
        careerTitle: {
          type: String,
          required: true,
        },
        matchScore: {
          type: Number,
          min: 0,
          max: 100,
          required: true,
        },
        confidence: {
          type: String,
          enum: ['high', 'medium', 'low'],
          default: 'medium',
        },
        
        strengths: [String],
        
        // Skill gaps
        skillGaps: [
          {
            skillId: {
              type: Schema.Types.ObjectId,
              ref: 'Skill',
              required: true,
            },
            skillName: {
              type: String,
              required: true,
            },
            currentLevel: {
              type: Number,
              min: 0,
              max: 10,
              required: true,
            },
            requiredLevel: {
              type: Number,
              min: 1,
              max: 10,
              required: true,
            },
            gap: {
              type: Number,
              required: true,
            },
            priority: {
              type: String,
              enum: ['critical', 'high', 'medium', 'low'],
              default: 'medium',
            },
          },
        ],
        
        // Recommended courses
        recommendedCourses: [
          {
            courseId: {
              type: Schema.Types.ObjectId,
              ref: 'Course',
              required: true,
            },
            reason: String,
            priority: {
              type: Number,
              min: 1,
            },
            skillsAddressed: [
              {
                type: Schema.Types.ObjectId,
                ref: 'Skill',
              },
            ],
            estimatedImpact: {
              type: Number,
              min: 0,
              max: 100,
            },
          },
        ],
        
        // Recommended roadmap
        recommendedRoadmap: {
          type: Schema.Types.ObjectId,
          ref: 'Roadmap',
        },
        
        customGuidance: {
          currentLevel: String,
          estimatedTimeToReady: String,
          nextSteps: [String],
          milestones: [
            {
              title: String,
              duration: String,
              tasks: [String],
              skillsRequired: [
                {
                  type: Schema.Types.ObjectId,
                  ref: 'Skill',
                },
              ],
              completed: {
                type: Boolean,
                default: false,
              },
            },
          ],
        },
        
        rank: {
          type: Number,
          required: true,
        },
      },
    ],
    
    studentSnapshot: {
      gpa: Number,
      skills: {
        type: Schema.Types.Mixed,
        required: true,
      },
      personality: {
        type: Schema.Types.Mixed,
        required: true,
      },
      interests: [String],
      preferences: Schema.Types.Mixed,
    },
    
    aiAnalysis: {
      overallAssessment: String,
      keyStrengths: [String],
      areasForImprovement: [String],
      careerReadiness: {
        type: String,
        enum: ['ready', 'needs_preparation', 'long_term'],
      },
      additionalNotes: String,
    },
    
    engagement: {
      viewed: {
        type: Boolean,
        default: false,
      },
      viewedAt: Date,
      acceptedCareer: String,
      feedback: {
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        helpful: Boolean,
        comments: String,
      },
    },
    
    expiresAt: Date,
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export const Recommendation: Model<IRecommendation> = mongoose.models.Recommendation || mongoose.model<IRecommendation>('Recommendation', RecommendationSchema);
