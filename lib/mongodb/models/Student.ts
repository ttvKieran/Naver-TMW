import mongoose, { Schema, Model } from 'mongoose';

export interface IStudent {
  userId: mongoose.Types.ObjectId;
  studentCode: string; // user_id in users.json
  
  // Personal Info
  fullName: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: string;
  university?: string;
  major?: string;
  careerGoals?: string;
  
  // Academic Info
  academic: {
    currentSemester: number;
    gpa: number;
    courses: Array<{
      code: string;
      name: string;
      grade: number;
    }>;
  };
  
  // Career Info
  career: {
    targetCareerId: string;
    actualCareer: string;
    targetConfidence?: number;
  };

  // Availability
  availability: {
    timePerWeekHours: number;
  };
  
  // Skills
  skills: {
    technical: Record<string, number>;
    general: Record<string, number>;
  };

  // Lists
  interests: string[];
  projects: string[];
  itSkills: string[];
  softSkills: string[];
  
  // Metadata
  meta?: {
    source?: string;
    createdAt?: Date;
    updatedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
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
    phone: String,
    dateOfBirth: Date,
    gender: String,
    university: String,
    major: String,
    careerGoals: String,

    // Academic Info
    academic: {
      currentSemester: { type: Number, default: 1 },
      gpa: { type: Number, default: 0 },
      courses: [{
        code: String,
        name: String,
        grade: Number
      }]
    },

    // Career Info
    career: {
      targetCareerId: String,
      actualCareer: String,
      targetConfidence: Number
    },

    // Availability
    availability: {
      timePerWeekHours: { type: Number, default: 0 }
    },

    // Skills
    skills: {
      technical: { type: Map, of: Number },
      general: { type: Map, of: Number }
    },

    // Lists
    interests: [String],
    projects: [String],
    itSkills: [String],
    softSkills: [String],

    // Metadata
    meta: {
      source: String,
      createdAt: Date,
      updatedAt: Date
    }
  },
  {
    timestamps: true,
  }
);

export const Student: Model<IStudent> = mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);
