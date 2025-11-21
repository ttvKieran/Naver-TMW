import mongoose, { Schema, Model } from 'mongoose';

export interface IStudent {
  userId: mongoose.Types.ObjectId;
  studentCode: string;
  
  // Personal Info
  fullName: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  
  // Academic Info
  university?: string;
  major?: string;
  currentYear?: number;
  cpa?: number;
  expectedGraduation?: Date;
  
  // Personality Assessment
  personality: {
    mbti?: string;
    traits: {
      analytical: number;
      creative: number;
      teamwork: number;
      leadership: number;
      technical: number;
    };
    assessmentDate?: Date;
    assessmentSource?: 'self' | 'ai' | 'test';
  };
  
  // Skills Assessment (References to Skills collection)
  studentSkills: Array<{
    skillId: mongoose.Types.ObjectId;
    proficiencyLevel: number; // 1-10 scale
    lastAssessed?: Date;
    source?: 'self-assessment' | 'ai-evaluation' | 'course-completion' | 'project';
    verifiedBy?: mongoose.Types.ObjectId; // User who verified
  }>;
  
  // Courses (References to Courses collection)
  studentCourses: Array<{
    courseId: mongoose.Types.ObjectId;
    status: 'not-started' | 'in-progress' | 'completed' | 'dropped';
    enrollmentDate?: Date;
    completionDate?: Date;
    progress?: number; // 0-100%
    certificateUrl?: string;
    grade?: string;
    notes?: string;
  }>;
  
  // Interests & Preferences
  interests: string[];
  careerGoals?: string;
  workPreferences?: {
    preferredIndustries?: string[];
    preferredWorkStyle?: 'remote' | 'office' | 'hybrid';
    willingToRelocate?: boolean;
    salaryExpectation?: {
      min?: number;
      max?: number;
      currency?: string;
    };
  };
  
  // Current Status
  currentCareer?: string;
  careerStatus?: 'exploring' | 'decided' | 'transitioning';
  
  // Metadata
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
      uppercase: true,
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
    
    // Academic Info
    university: String,
    major: String,
    currentYear: {
      type: Number,
      min: 1,
      max: 6,
    },
    cpa: {
      type: Number,
      min: 0,
      max: 4.0,
    },
    expectedGraduation: Date,
    
    // Personality
    personality: {
      mbti: {
        type: String,
        uppercase: true,
      },
      traits: {
        analytical: { type: Number, min: 0, max: 10, default: 5 },
        creative: { type: Number, min: 0, max: 10, default: 5 },
        teamwork: { type: Number, min: 0, max: 10, default: 5 },
        leadership: { type: Number, min: 0, max: 10, default: 5 },
        technical: { type: Number, min: 0, max: 10, default: 5 },
      },
      assessmentDate: Date,
      assessmentSource: {
        type: String,
        enum: ['self', 'ai', 'test'],
      },
    },
    
    // Skills (References)
    studentSkills: [
      {
        skillId: {
          type: Schema.Types.ObjectId,
          ref: 'Skill',
          required: true,
        },
        proficiencyLevel: {
          type: Number,
          min: 1,
          max: 10,
          required: true,
        },
        lastAssessed: Date,
        source: {
          type: String,
          enum: ['self-assessment', 'ai-evaluation', 'course-completion', 'project'],
          default: 'self-assessment',
        },
        verifiedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    
    // Courses (References)
    studentCourses: [
      {
        courseId: {
          type: Schema.Types.ObjectId,
          ref: 'Course',
          required: true,
        },
        status: {
          type: String,
          enum: ['not-started', 'in-progress', 'completed', 'dropped'],
          default: 'not-started',
        },
        enrollmentDate: Date,
        completionDate: Date,
        progress: {
          type: Number,
          min: 0,
          max: 100,
          default: 0,
        },
        certificateUrl: String,
        grade: String,
        notes: String,
      },
    ],
    
    // Interests
    interests: {
      type: [String],
      default: [],
    },
    careerGoals: String,
    workPreferences: {
      preferredIndustries: [String],
      preferredWorkStyle: {
        type: String,
        enum: ['remote', 'office', 'hybrid'],
      },
      willingToRelocate: Boolean,
      salaryExpectation: {
        min: Number,
        max: Number,
        currency: {
          type: String,
          default: 'VND',
        },
      },
    },
    
    // Status
    currentCareer: String,
    careerStatus: {
      type: String,
      enum: ['exploring', 'decided', 'transitioning'],
      default: 'exploring',
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

// Calculate profile completeness before saving
StudentSchema.pre('save', function (next) {
  const requiredFields = [
    this.fullName,
    this.cpa,
    this.personality?.mbti,
    this.studentSkills?.length,
    this.interests?.length,
  ];
  
  const filledFields = requiredFields.filter((field) => field !== undefined && field !== null).length;
  this.profileCompleteness = Math.round((filledFields / requiredFields.length) * 100);
  
  next();
});

export const Student: Model<IStudent> = mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);
