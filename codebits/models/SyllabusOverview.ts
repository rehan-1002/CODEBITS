import mongoose, { Schema, Document, Model } from 'mongoose';
import { SyllabusOverviewData } from '@/types/resources';

export interface ISyllabusOverview extends Document {
  resourceId: mongoose.Types.ObjectId;
  overview: SyllabusOverviewData;
  modelUsed: string;
  createdAt: Date;
  updatedAt: Date;
}

const SyllabusOverviewSchema = new Schema<ISyllabusOverview>(
  {
    resourceId: {
      type: Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
      unique: true,
      index: true,
    },
    overview: {
      type: Schema.Types.Mixed,
      required: true,
    },
    modelUsed: {
      type: String,
      default: 'gemini-2.5-flash',
    },
  },
  {
    timestamps: true,
  }
);

export const SyllabusOverviewModel: Model<ISyllabusOverview> =
  mongoose.models.SyllabusOverview ||
  mongoose.model<ISyllabusOverview>('SyllabusOverview', SyllabusOverviewSchema);
