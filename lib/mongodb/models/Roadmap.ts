import mongoose, { Schema, Model } from 'mongoose';

// Roadmap Interface & Schema (matching data/jobs/*.json structure)
export interface IRoadmap {
  careerID: string; // career_id in jobs JSON
  careerName: string; // career_name in jobs JSON
  description?: string;
  
  // Stages structure (matching jobs JSON)
  stages: Array<{
    id: string; // stage_1_bde_foundation
    name: string; // "Giai đoạn 1 - Nền tảng lập trình và hệ thống"
    description?: string;
    orderIndex: number; // order_index
    recommendedSemesters?: number[]; // recommended_semesters
    
    // Areas within stage
    areas: Array<{
      id: string; // bde_programming_basics
      name: string; // "Lập trình cho data"
      description?: string;
      orderIndex: number;
      
      // Skills to learn in this phase
      skillsToLearn: Array<{
        skillId: mongoose.Types.ObjectId;
        targetProficiency: number;
        priority: 'essential' | 'recommended' | 'optional';
        estimatedTime?: string;
        skillTags?: string[];
        prerequisites?: string[];
        requiredSkills?: Array<{ tag: string; min_level: number }>;
        estimatedHours?: number;
      }>;
      
      // Courses for this phase
      recommendedCourses?: Array<{
        courseId: mongoose.Types.ObjectId;
        isRequired: boolean;
        order: number;
        alternativeCourses?: mongoose.Types.ObjectId[];
        prerequisites?: string[];
        estimatedHours?: number;
      }>;
      
      // Projects/Milestones
      milestones?: Array<{
        title: string;
        description?: string;
        skillsApplied: mongoose.Types.ObjectId[];
        estimatedTime?: string;
        deliverable?: string;
        resources?: string[];
        prerequisites?: string[];
        requiredSkills?: Array<{ tag: string; min_level: number }>;
        estimatedHours?: number;
        skillTags?: string[];
      }>;
    }>;
  }>;
  
  // Metadata
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastReviewed?: Date;
  createdBy?: mongoose.Types.ObjectId;
}

const RoadmapSchema = new Schema<IRoadmap>(
  {
    careerID: {
      type: String,
      required: true,
      unique: true,
    },
    careerName: {
      type: String,
      required: true,
    },
    description: String,
    
    // Stages structure (matching jobs JSON)
    stages: [
      {
        id: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        description: String,
        orderIndex: {
          type: Number,
          required: true,
        },
        recommendedSemesters: [Number],
        
        // Areas within stage
        areas: [
          {
            id: {
              type: String,
              required: true,
            },
            name: {
              type: String,
              required: true,
            },
            description: String,
            orderIndex: {
              type: Number,
              required: true,
            },
            
            // Items within area
            items: [
              {
                skillId: {
                  type: Schema.Types.ObjectId,
                  ref: 'Skill',
                  required: true,
                },
                targetProficiency: {
                  type: Number,
                  min: 1,
                  max: 10,
                  required: true,
                },
                priority: {
                  type: String,
                  enum: ['essential', 'recommended', 'optional'],
                  default: 'recommended',
                },
                estimatedTime: String,
                skillTags: [String],
                prerequisites: [String],
                requiredSkills: [{ tag: String, min_level: Number }],
                estimatedHours: Number,
              },
            ],
            
            // Courses
            recommendedCourses: [
              {
                courseId: {
                  type: Schema.Types.ObjectId,
                  ref: 'Course',
                  required: true,
                },
                isRequired: {
                  type: Boolean,
                  default: false,
                },
                order: Number,
                alternativeCourses: [
                  {
                    type: Schema.Types.ObjectId,
                    ref: 'Course',
                  },
                ],
                prerequisites: [String],
                estimatedHours: Number,
              },
            ],
            
            // Milestones
            milestones: [
              {
                title: {
                  type: String,
                  required: true,
                },
                name: {
                  type: String,
                  required: true,
                },
                itemType: {
                  type: String,
                  required: true,
                  enum: ['skill', 'concept', 'tool', 'project', 'course'],
                },
                description: String,
                skillsApplied: [
                  {
                    type: Schema.Types.ObjectId,
                    ref: 'Skill',
                  },
                ],
                estimatedTime: String,
                deliverable: String,
                resources: [String],
                prerequisites: [String],
                requiredSkills: [{ tag: String, min_level: Number }],
                estimatedHours: Number,
                skillTags: [String],
                orderIndex: {
                  type: Number,
                  required: true,
                },
              },
            ],
          },
        ],
      },
    ],
    
    isActive: {
      type: Boolean,
      default: true,
    },
    lastReviewed: Date,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
RoadmapSchema.index({ careerID: 1 });
RoadmapSchema.index({ isActive: 1 });

export const Roadmap: Model<IRoadmap> = mongoose.models.Roadmap || mongoose.model<IRoadmap>('Roadmap', RoadmapSchema);
