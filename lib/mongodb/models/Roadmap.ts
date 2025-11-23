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
      
      // Items within area
      items: Array<{
        id: string; // bde_python_java_basics
        name: string; // "Lập trình Python hoặc Java cơ bản"
        itemType: string; // "skill", "concept", "tool", "project"
        description?: string;
        skillTags?: string[]; // ["Python", "Java", "Programming Fundamentals"]
        prerequisites?: string[]; // Array of item IDs
        requiredSkills?: string[]; // Array of skill names
        estimatedHours?: number;
        orderIndex: number;
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
                id: {
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
                skillTags: [String],
                prerequisites: [String], // Array of item IDs
                requiredSkills: [String], // Array of skill names
                estimatedHours: Number,
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
