import mongoose, { Schema, Document, Model } from 'mongoose';
import { AcademicBranch, AcademicSemester } from '@/types/resources';

export interface IQuestionPaper extends Document {
  subject: string;
  semester: number;
  branch: string;
  branchName?: string;
  year?: string;
  session?: string;
  scheme?: string;
  isNep?: boolean;
  pdfUrl: string;
  slug?: string;
  source?: string;
  title?: string;
  view_count?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const QuestionPaperSchema = new Schema<IQuestionPaper>(
  {
    subject: { type: String, required: true, trim: true },
    semester: { type: Number, required: true },
    branch: { type: String, required: true, trim: true },
    branchName: { type: String, trim: true },
    year: { type: String, trim: true },
    session: { type: String, trim: true },
    scheme: { type: String, trim: true },
    isNep: { type: Boolean, default: false },
    pdfUrl: { type: String, required: true, trim: true },
    slug: { type: String, trim: true },
    source: { type: String, trim: true },
    title: { type: String, trim: true },
    view_count: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    collection: 'question_papers',
  }
);

// Helpful index for fast branch & semester queries
QuestionPaperSchema.index({ branch: 1, semester: 1 });
QuestionPaperSchema.index({ subject: 'text', branchName: 'text' });

export function mapQpBranchToAcademicBranch(branch: string, semester?: number): AcademicBranch {
  const b = (branch || '').toLowerCase().trim();
  if (b === 'fe' || semester === 1 || semester === 2) return 'ALL';
  if (b === 'comps') return 'COMPS';
  if (b === 'it') return 'IT';
  if (b === 'aids' || b === 'aiml') return 'AI-DS';
  if (b === 'mech') return 'MECH';
  if (b === 'civil') return 'CIVIL';
  if (b === 'electrical' || b === 'extc') return 'EXTC';
  return 'ALL';
}

export function mapAcademicBranchToQpBranches(branch: AcademicBranch): string[] {
  switch (branch) {
    case 'COMPS':
      return ['comps'];
    case 'IT':
      return ['it'];
    case 'AI-DS':
      return ['aids', 'aiml'];
    case 'MECH':
      return ['mech'];
    case 'CIVIL':
      return ['civil'];
    case 'EXTC':
      return ['electrical', 'extc'];
    case 'ALL':
    default:
      return ['fe', 'comps', 'it', 'aids', 'aiml', 'mech', 'civil', 'electrical'];
  }
}

export const QuestionPaperModel: Model<IQuestionPaper> =
  mongoose.models.QuestionPaper ||
  mongoose.model<IQuestionPaper>('QuestionPaper', QuestionPaperSchema, 'question_papers');
