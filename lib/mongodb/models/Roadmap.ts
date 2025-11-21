import mongoose, { Schema, Model } from 'mongoose';

// Roadmap Interface & Schema (Hierarchical: Levels → Phases → Skills/Courses)
export interface IRoadmap {
  careerId: mongoose.Types.ObjectId;
  
  // Metadata
  title: string;
  description?: string;
  version: string;
  
  // Hierarchical Structure
  levels: Array<{
    levelId: string;
    levelNumber: number;
    title: string;
    description?: string;
    duration: string;
    
    // Prerequisites for this level
    prerequisites?: {
      previousLevel?: string;
      minimumGPA?: number;
      requiredSkills?: Array<{
        skillId: mongoose.Types.ObjectId;
        minimumProficiency: number;
      }>;
      requiredCourses?: mongoose.Types.ObjectId[];
    };
    
    // Goals
    goals: string[];
    
    // Phases within this level
    phases: Array<{
      phaseId: string;
      phaseNumber: number;
      title: string;
      description?: string;
      duration: string;
      
      // Skills to learn in this phase
      skillsToLearn: Array<{
        skillId: mongoose.Types.ObjectId;
        targetProficiency: number;
        priority: 'essential' | 'recommended' | 'optional';
        estimatedTime?: string;
      }>;
      
      // Courses for this phase
      recommendedCourses?: Array<{
        courseId: mongoose.Types.ObjectId;
        isRequired: boolean;
        order: number;
        alternativeCourses?: mongoose.Types.ObjectId[];
      }>;
      
      // Projects/Milestones
      milestones?: Array<{
        title: string;
        description?: string;
        skillsApplied: mongoose.Types.ObjectId[];
        estimatedTime?: string;
        deliverable?: string;
        resources?: string[];
      }>;
      
      isOptional?: boolean;
      dependencies?: string[];
    }>;
    
    // Completion criteria for this level
    completionCriteria?: {
      requiredSkillProficiency?: Array<{
        skillId: mongoose.Types.ObjectId;
        minimumLevel: number;
      }>;
      requiredMilestones?: string[];
      requiredCourses?: mongoose.Types.ObjectId[];
      suggestedProjects?: string[];
    };
  }>;
  
  // Overall summary
  totalDuration?: string;
  totalSkills?: number;
  totalCourses?: number;
  totalMilestones?: number;
  difficultyProgression?: string;
  
  // Metadata
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastReviewed?: Date;
  createdBy?: mongoose.Types.ObjectId;
}

const RoadmapSchema = new Schema<IRoadmap>(
  {
    careerId: {
      type: Schema.Types.ObjectId,
      ref: 'Career',
      required: true,
    },
    
    title: {
      type: String,
      required: true,
    },
    description: String,
    version: {
      type: String,
      required: true,
      default: '1.0',
    },
    
    // Hierarchical Levels Structure
    levels: [
      {
        levelId: {
          type: String,
          required: true,
        },
        levelNumber: {
          type: Number,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        description: String,
        duration: {
          type: String,
          required: true,
        },
        
        prerequisites: {
          previousLevel: String,
          minimumGPA: Number,
          requiredSkills: [
            {
              skillId: {
                type: Schema.Types.ObjectId,
                ref: 'Skill',
              },
              minimumProficiency: {
                type: Number,
                min: 1,
                max: 10,
              },
            },
          ],
          requiredCourses: [
            {
              type: Schema.Types.ObjectId,
              ref: 'Course',
            },
          ],
        },
        
        goals: [String],
        
        // Phases within level
        phases: [
          {
            phaseId: {
              type: String,
              required: true,
            },
            phaseNumber: {
              type: Number,
              required: true,
            },
            title: {
              type: String,
              required: true,
            },
            description: String,
            duration: {
              type: String,
              required: true,
            },
            
            // Skills to learn
            skillsToLearn: [
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
              },
            ],
            
            // Milestones
            milestones: [
              {
                title: {
                  type: String,
                  required: true,
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
              },
            ],
            
            isOptional: {
              type: Boolean,
              default: false,
            },
            dependencies: [String],
          },
        ],
        
        // Completion criteria
        completionCriteria: {
          requiredSkillProficiency: [
            {
              skillId: {
                type: Schema.Types.ObjectId,
                ref: 'Skill',
              },
              minimumLevel: {
                type: Number,
                min: 1,
                max: 10,
              },
            },
          ],
          requiredMilestones: [String],
          requiredCourses: [
            {
              type: Schema.Types.ObjectId,
              ref: 'Course',
            },
          ],
          suggestedProjects: [String],
        },
      },
    ],
    
    // Summary
    totalDuration: String,
    totalSkills: Number,
    totalCourses: Number,
    totalMilestones: Number,
    difficultyProgression: String,
    
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

// Pre-save hook to calculate totals
RoadmapSchema.pre('save', function (next) {
  if (this.levels && this.levels.length > 0) {
    const uniqueSkills = new Set<string>();
    const uniqueCourses = new Set<string>();
    let totalMilestones = 0;
    
    this.levels.forEach((level) => {
      level.phases?.forEach((phase) => {
        phase.skillsToLearn?.forEach((skill) => {
          uniqueSkills.add(skill.skillId.toString());
        });
        phase.recommendedCourses?.forEach((course) => {
          uniqueCourses.add(course.courseId.toString());
        });
        totalMilestones += phase.milestones?.length || 0;
      });
    });
    
    this.totalSkills = uniqueSkills.size;
    this.totalCourses = uniqueCourses.size;
    this.totalMilestones = totalMilestones;
  }
  
  next();
});

export const Roadmap: Model<IRoadmap> = mongoose.models.Roadmap || mongoose.model<IRoadmap>('Roadmap', RoadmapSchema);
