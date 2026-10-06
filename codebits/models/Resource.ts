import mongoose, { Schema, Document, Model } from 'mongoose';
import { AcademicBranch, AcademicSemester, DocumentCategory, ModerationStatus, AcademicScheme } from '@/types/resources';

export interface IResource extends Document {
  title: string;
  subject: string;
  branch: AcademicBranch;
  semester: AcademicSemester;
  scheme: AcademicScheme;
  category: DocumentCategory;
  file_url: string;
  file_size?: number;
  page_count?: number;
  uploader_id: string;
  uploader_name: string;
  uploader_role: 'student' | 'admin';
  status: ModerationStatus;
  view_count: number;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    branch: {
      type: String,
      required: true,
      enum: ['ALL', 'COMPS', 'IT', 'AI-DS', 'EXTC', 'MECH', 'CIVIL'],
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    scheme: {
      type: String,
      required: true,
      enum: ['Mumbai University', 'Autonomous', 'General'],
      default: 'Mumbai University',
    },
    category: {
      type: String,
      required: true,
      enum: ['pyq', 'notes', 'syllabus', 'solution'],
    },
    file_url: {
      type: String,
      required: true,
      trim: true,
    },
    file_size: {
      type: Number,
      default: 0,
    },
    page_count: {
      type: Number,
      default: 1,
    },
    uploader_id: {
      type: String,
      required: true,
      trim: true,
    },
    uploader_name: {
      type: String,
      required: true,
      trim: true,
    },
    uploader_role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },
    view_count: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast searching in the Academic Vault
ResourceSchema.index({ branch: 1, semester: 1, category: 1, status: 1 });
ResourceSchema.index({ subject: 'text', title: 'text' });

export const ResourceModel: Model<IResource> =
  mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema);
