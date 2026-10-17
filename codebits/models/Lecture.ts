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

// Helper function to extract 11-char YouTube ID from any format
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const clean = url.trim();

  // If user pasted just the 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }

  // Matches youtube.com/watch?v=..., youtu.be/..., youtube.com/live/..., etc.
  const regex =
    /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|live|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const match = clean.match(regex);
  return match ? match[1] : null;
}

export function getYouTubeThumbnail(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}

export const Lecture: Model<ILecture> =
  mongoose.models.Lecture || mongoose.model<ILecture>("Lecture", LectureSchema);
