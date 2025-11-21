import mongoose, { Schema, Model } from 'mongoose';

export interface IChatSession {
  studentId: mongoose.Types.ObjectId;
  
  sessionInfo: {
    startedAt: Date;
    endedAt?: Date;
    status: 'active' | 'completed' | 'abandoned';
    purpose?: string;
  };
  
  messages: Array<{
    messageId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    toolCalls?: Array<{
      toolName: string;
      parameters: Record<string, any>;
      result?: Record<string, any>;
    }>;
    tokenUsage?: {
      prompt: number;
      completion: number;
      total: number;
    };
  }>;
  
  context?: {
    currentTopic?: string;
    careersDiscussed?: string[];
    recommendationsGiven?: mongoose.Types.ObjectId[];
    userPreferences?: Record<string, any>;
  };
  
  aiModelInfo?: {
    modelName: string;
    temperature?: number;
    topP?: number;
  };
  
  totalMessages: number;
  totalTokensUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSessionSchema = new Schema<IChatSession>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    
    sessionInfo: {
      startedAt: {
        type: Date,
        required: true,
        default: Date.now,
      },
      endedAt: Date,
      status: {
        type: String,
        enum: ['active', 'completed', 'abandoned'],
        default: 'active',
      },
      purpose: String,
    },
    
    messages: [
      {
        messageId: {
          type: String,
          // required: true,
        },
        role: {
          type: String,
          enum: ['user', 'assistant', 'system'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        toolCalls: [
          {
            toolName: String,
            parameters: Schema.Types.Mixed,
            result: Schema.Types.Mixed,
          },
        ],
        tokenUsage: {
          prompt: Number,
          completion: Number,
          total: Number,
        },
      },
    ],
    
    context: {
      currentTopic: String,
      careersDiscussed: [String],
      recommendationsGiven: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Recommendation',
        },
      ],
      userPreferences: Schema.Types.Mixed,
    },
    
    aiModelInfo: {
      modelName: String,
      temperature: Number,
      topP: Number,
    },
    
    totalMessages: {
      type: Number,
      default: 0,
    },
    totalTokensUsed: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Update totalMessages and totalTokensUsed before saving
ChatSessionSchema.pre('save', function (next) {
  this.totalMessages = this.messages.length;
  this.totalTokensUsed = this.messages.reduce(
    (sum, msg) => sum + (msg.tokenUsage?.total || 0),
    0
  );
  next();
});

export const ChatSession: Model<IChatSession> = mongoose.models.ChatSession || mongoose.model<IChatSession>('ChatSession', ChatSessionSchema);
