import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnswerCache extends Document {
  questionHash: string;
  questionText: string;
  marks: number;
  subject?: string;
  answerMarkdown: string;
  keyTakeaways?: string[];
  diagramDescription?: string;
  source: 'ai_gemini' | 'verified_faculty';
  modelUsed: string;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const AnswerCacheSchema = new Schema<IAnswerCache>(
  {
    questionHash: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    marks: {
      type: Number,
      required: true,
      enum: [2, 3, 4, 5, 10],
      index: true,
    },
    subject: {
      type: String,
      trim: true,
      default: 'Mumbai University Engineering',
    },
    answerMarkdown: {
      type: String,
      required: true,
    },
    keyTakeaways: {
      type: [String],
      default: [],
    },
    diagramDescription: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      enum: ['ai_gemini', 'verified_faculty'],
      default: 'ai_gemini',
    },
    modelUsed: {
      type: String,
      default: 'gemini-2.5-flash',
    },
    viewCount: {
      type: Number,
      default: 1,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index on normalized question hash and mark weightage
AnswerCacheSchema.index({ questionHash: 1, marks: 1 }, { unique: true });

if (mongoose.models && mongoose.models.AnswerCache) {
  delete mongoose.models.AnswerCache;
}

export const AnswerCacheModel: Model<IAnswerCache> =
  mongoose.models.AnswerCache || mongoose.model<IAnswerCache>('AnswerCache', AnswerCacheSchema);
