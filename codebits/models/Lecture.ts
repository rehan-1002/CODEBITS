import mongoose, { Schema, Document, Model } from "mongoose";
import { AcademicBranch, AcademicSemester } from "@/types/resources";

export interface ILecture extends Document {
  title: string;
  subject: string;
  faculty: string;
  branch: AcademicBranch;
  semester: AcademicSemester;
  youtubeUrl: string;
  youtubeId: string;
  thumbnailUrl: string;
  isLive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LectureSchema = new Schema<ILecture>(
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
    faculty: {
      type: String,
      trim: true,
      default: "Prof. Rohit Falake (M.R.F)",
      maxlength: 120,
    },
    branch: {
      type: String,
      required: true,
      enum: ["ALL", "COMPS", "IT", "AI-DS", "EXTC", "MECH", "CIVIL"],
      default: "ALL",
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
      default: 1,
    },
    youtubeUrl: {
      type: String,
      required: true,
      trim: true,
    },
    youtubeId: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
      trim: true,
    },
    isLive: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export { extractYouTubeId, getYouTubeThumbnail } from "@/lib/youtube";

export const Lecture: Model<ILecture> =
  mongoose.models.Lecture || mongoose.model<ILecture>("Lecture", LectureSchema);
