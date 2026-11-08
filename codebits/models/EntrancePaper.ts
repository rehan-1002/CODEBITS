import mongoose, { Schema, Document, Model } from 'mongoose';

export type EntranceExamType = 'HSC' | 'MHT-CET' | 'JEE-MAIN' | 'JEE-ADVANCED';

export interface IEntrancePaper extends Document {
  examType: EntranceExamType;
  subject: string;
  year: number;
  session?: string;
  shift?: string;
  examDate?: string;
  questionCount?: number;
  maxMarks?: number;
  pdfUrl: string;
  solutionPdfUrl?: string;
  hasSolutions: boolean;
  title: string;
  source?: string;
  view_count: number;
  status: 'approved' | 'pending' | 'rejected';
  verified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const EntrancePaperSchema = new Schema<IEntrancePaper>(
  {
    examType: {
      type: String,
      required: true,
      enum: ['HSC', 'MHT-CET', 'JEE-MAIN', 'JEE-ADVANCED'],
      index: true,
    },
    subject: { type: String, required: true, trim: true },
    year: { type: Number, required: true, index: true },
    session: { type: String, trim: true },
    shift: { type: String, trim: true },
    examDate: { type: String, trim: true },
    questionCount: { type: Number, default: 0 },
    maxMarks: { type: Number, default: 0 },
    pdfUrl: { type: String, required: true, trim: true },
    solutionPdfUrl: { type: String, trim: true },
    hasSolutions: { type: Boolean, default: false },
    title: { type: String, required: true, trim: true },
    source: { type: String, trim: true },
    view_count: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      default: 'approved',
      enum: ['approved', 'pending', 'rejected'],
    },
    verified: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: 'entrance_papers',
  }
);

EntrancePaperSchema.index({ examType: 1, year: -1, subject: 1 });
EntrancePaperSchema.index({ title: 'text', subject: 'text' });

export const EntrancePaperModel: Model<IEntrancePaper> =
  mongoose.models.EntrancePaper ||
  mongoose.model<IEntrancePaper>('EntrancePaper', EntrancePaperSchema, 'entrance_papers');

