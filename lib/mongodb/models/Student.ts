import mongoose, { Schema, Model } from 'mongoose';

export interface IStudent {
  userId: mongoose.Types.ObjectId;
  studentCode: string; // user_id in users.json
  
  // Personal Info
  fullName: string; // full_name in users.json
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  
  // Academic Info (academic object in users.json)
  academic: {
    currentSemester: number; // current_semester
    gpa: number; // gpa (thang 4.0)
    courses: Array<{
      code: string;
      name: string;
      semester: number; // kỳ học (1-9)
      grade: number; // thang 10
    }>;
  };
  university?: string;
  major?: string;
  
  // Career Info (career object in users.json)
  career: {
    targetCareerID: string; // target_career_id
    actualCareer?: string; // actual_career
    targetConfidence?: number; // target_confidence
  };
  
  // Availability
  availability: {
    timePerWeekHours: number; // time_per_week_hours
  };
  
  // Skills (skills object in users.json)
  skills: {
    technical: Record<string, number>; // python: 4, javascript: 3, etc. (1-10)
    general: Record<string, number>; // programming: 5, problem_solving: 8, etc. (1-10)
  };
  
  // IT and Soft Skills (arrays in users.json)
  itSkill: string[]; // it_skill array
  softSkill: string[]; // soft_skill array
  
  // Interests & Projects
  interests: string[]; // interests array (game_dev, web_dev, etc.)
  projects: string[]; // projects array
  
  // Personality Assessment (optional, for future use)
  personality?: {
    mbti?: string;
    traits?: {
      analytical?: number;
      creative?: number;
      teamwork?: number;
      leadership?: number;
      technical?: number;
    };
    assessmentDate?: Date;
    assessmentSource?: 'self' | 'ai' | 'test';
  };
  
  // Career Goals
  careerGoals?: string;
  careerStatus?: 'exploring' | 'decided' | 'transitioning';
  aiCareerRecommendation?: string; // HCX-007 career recommendation text
  
  // Metadata (meta object in users.json)
  meta?: {
    source?: string;
    createdAt?: Date;
    updatedAt?: Date;
  };
  
  // MongoDB timestamps
  createdAt: Date;
  updatedAt: Date;
  profileCompleteness: number;
}

const StudentSchema = new Schema<IStudent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    studentCode: {
      type: String,
      required: true,
      unique: true,
    },
    
    // Personal Info
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    phone: String,
    
    // Academic Info (matching users.json structure)
    academic: {
      currentSemester: {
        type: Number,
        required: true,
        min: 1,
        max: 12,
      },
      gpa: {
        type: Number,
        required: true,
        min: 0,
        max: 4.0,
      },
      courses: [
        {
          _id: false, // Tắt auto-generate _id cho subdocuments
          code: {
            type: String,
            required: true,
          },
          name: {
            type: String,
            required: true,
          },
          semester: {
            type: Number,
            required: true,
            min: 1,
            max: 9, // kỳ học (1-9)
          },
          grade: {
            type: Number,
            required: true,
            min: 0,
            max: 10, // thang 10
          },
        },
      ],
    },
    university: String,
    major: String,
    
    // Career Info
    career: {
      targetCareerID: {
        type: String,
        required: true,
      },
      actualCareer: String,
      targetConfidence: Number,
    },
    
    // Availability
    availability: {
      timePerWeekHours: {
        type: Number,
        required: true,
        min: 0,
        max: 168, // max hours in a week
      },
    },
    
    // Skills (matching users.json structure)
    skills: {
      technical: {
        type: Map,
        of: Number, // skill_name: level (1-10)
      },
      general: {
        type: Map,
        of: Number, // skill_name: level (1-10)
      },
    },
    
    // IT and Soft Skills arrays
    itSkill: {
      type: [String],
      default: [],
    },
    softSkill: {
      type: [String],
      default: [],
    },
    
    // Interests & Projects
    interests: {
      type: [String],
      default: [],
    },
    projects: {
      type: [String],
      default: [],
    },
    
    // Personality (optional)
    personality: {
      mbti: {
        type: String,
        uppercase: true,
      },
      traits: {
        analytical: { type: Number, min: 0, max: 10 },
        creative: { type: Number, min: 0, max: 10 },
        teamwork: { type: Number, min: 0, max: 10 },
        leadership: { type: Number, min: 0, max: 10 },
        technical: { type: Number, min: 0, max: 10 },
      },
      assessmentDate: Date,
      assessmentSource: {
        type: String,
        enum: ['self', 'ai', 'test'],
      },
    },
    
    // Career Goals
    careerGoals: String,
    careerStatus: {
      type: String,
      enum: ['exploring', 'decided', 'transitioning'],
      default: 'exploring',
    },
    aiCareerRecommendation: String, // HCX-007 career recommendation
    
    // Metadata
    meta: {
      source: String,
      createdAt: Date,
      updatedAt: Date,
    },
    
    profileCompleteness: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Xóa cached model để đảm bảo schema mới được load
if (mongoose.models.Student) {
  delete mongoose.models.Student;
}

export const Student: Model<IStudent> = mongoose.model<IStudent>('Student', StudentSchema);
