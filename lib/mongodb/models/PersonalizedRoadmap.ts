import mongoose, { Schema, Model } from 'mongoose';

// PersonalizedRoadmap - Roadmap được cá nhân hóa cho từng sinh viên
// Format matching clova-rag-roadmap API response and data/jobs/*.json structure
export interface IPersonalizedRoadmap {
  studentId: mongoose.Types.ObjectId;
  roadmapId?: mongoose.Types.ObjectId; // Optional, might not have base roadmap
  
  // Career info (from API response: career_id, career_name)
  careerID: string; // e.g., "machine_learning"
  careerName: string; // e.g., "Machine Learning Engineer"
  
  // Metadata
  description?: string;
  generatedAt: Date;
  lastUpdated: Date;
  
  // Full roadmap structure from clova-rag-roadmap API
  // Matches data/jobs/*.json format with added personalization
  stages: Array<{
    id: string; // stage_1_ml_foundation
    name: string; // "Giai đoạn 1 - Nền tảng..."
    description?: string;
    orderIndex: number; // order_index from API
    recommendedSemesters?: number[]; // recommended_semesters
    
    areas: Array<{
      id: string; // ml_programming_basics
      name: string; // "Lập trình Python..."
      description?: string;
      orderIndex?: number;
      
      items: Array<{
        id: string; // ml_python_fundamentals
        name: string; // "Python cơ bản"
        itemType?: string; // skill, concept, project, certification
        description?: string;
        skillTags?: string[]; // skill_tags
        prerequisites?: string[]; // IDs of prerequisite items
        requiredSkills?: Array<{
          tag: string;
          minLevel: number;
        }>; // required_skills
        estimatedHours?: number; // estimated_hours
        orderIndex?: number; // order_index
        
        // AI Personalization (added by clova-rag-roadmap)
        check?: boolean; // Has the student completed/mastered this?
        personalization?: {
          status: 'already_mastered' | 'high_priority' | 'medium_priority' | 'low_priority' | 'optional' | 'not_assigned';
          priority: number; // 0 = highest priority
          personalizedDescription?: string; // AI explanation for this student
          reason?: string; // Why this status/priority
        };
        
        // Student progress tracking (manual updates)
        progress?: {
          startedAt?: Date;
          completedAt?: Date;
          progressPercentage?: number;
          notes?: string;
        };
      }>;
    }>;
  }>;
  
  // Overall progress
  overallProgress: {
    totalItems: number;
    completedItems: number;
    inProgressItems: number;
    percentageComplete: number;
    estimatedCompletionDate?: Date;
  };
  
  // AI generation info
  generationSource: {
    model: string; // e.g., "HCX-007"
    generatedBy: 'clova-rag' | 'manual' | 'hybrid';
    confidence?: number;
    apiVersion?: string;
  };
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PersonalizedRoadmapSchema = new Schema<IPersonalizedRoadmap>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    roadmapId: {
      type: Schema.Types.ObjectId,
      ref: 'Roadmap',
    },
    
    // Career info matching API format
    careerID: {
      type: String,
      required: true,
      index: true,
    },
    careerName: {
      type: String,
      required: true,
    },
    
    description: String,
    generatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    
    // Stages matching data/jobs/*.json format
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
            orderIndex: Number,
            
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
                itemType: String, // skill, concept, project, certification
                description: String,
                skillTags: [String],
                prerequisites: [String],
                requiredSkills: [
                  {
                    tag: String,
                    minLevel: Number,
                  },
                ],
                estimatedHours: Number,
                orderIndex: Number,
                
                // AI Personalization
                check: {
                  type: Boolean,
                  default: false,
                },
                personalization: {
                  status: {
                    type: String,
                    enum: ['already_mastered', 'high_priority', 'medium_priority', 'low_priority', 'optional', 'not_assigned'],
                    default: 'not_assigned',
                  },
                  priority: {
                    type: Number,
                    default: 999,
                  },
                  personalizedDescription: String,
                  reason: String,
                },
                
                // Progress tracking
                progress: {
                  startedAt: Date,
                  completedAt: Date,
                  progressPercentage: {
                    type: Number,
                    min: 0,
                    max: 100,
                    default: 0,
                  },
                  notes: String,
                },
              },
            ],
          },
        ],
      },
    ],
    
    overallProgress: {
      totalItems: {
        type: Number,
        default: 0,
      },
      completedItems: {
        type: Number,
        default: 0,
      },
      inProgressItems: {
        type: Number,
        default: 0,
      },
      percentageComplete: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      estimatedCompletionDate: Date,
    },
    
    generationSource: {
      model: {
        type: String,
        required: true,
        default: 'HCX-007',
      },
      generatedBy: {
        type: String,
        enum: ['clova-rag', 'manual', 'hybrid'],
        required: true,
        default: 'clova-rag',
      },
      confidence: Number,
      apiVersion: String,
    },
    
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate overall progress
PersonalizedRoadmapSchema.pre('save', function (next) {
  if (this.stages && this.stages.length > 0) {
    let totalItems = 0;
    let completedItems = 0;
    let inProgressItems = 0;
    
    this.stages.forEach((stage) => {
      stage.areas?.forEach((area) => {
        area.items?.forEach((item) => {
          totalItems++;
          if (item.check || item.progress?.progressPercentage === 100) {
            completedItems++;
          } else if (item.progress && item.progress.progressPercentage && item.progress.progressPercentage > 0) {
            inProgressItems++;
          }
        });
      });
    });
    
    this.overallProgress.totalItems = totalItems;
    this.overallProgress.completedItems = completedItems;
    this.overallProgress.inProgressItems = inProgressItems;
    this.overallProgress.percentageComplete = totalItems > 0 
      ? Math.round((completedItems / totalItems) * 100) 
      : 0;
  }
  
  this.lastUpdated = new Date();
  next();
});

// Index for faster queries
PersonalizedRoadmapSchema.index({ studentId: 1, careerId: 1 });
PersonalizedRoadmapSchema.index({ studentId: 1, isActive: 1 });

export const PersonalizedRoadmap: Model<IPersonalizedRoadmap> = 
  mongoose.models.PersonalizedRoadmap || 
  mongoose.model<IPersonalizedRoadmap>('PersonalizedRoadmap', PersonalizedRoadmapSchema);
