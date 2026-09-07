/**
 * CodeBits Portal - Academic Catalog & Resource Domain Types
 * Specific to Mumbai University Rev-2019 'C' Scheme engineering.
 */

export type AcademicBranch =
  | "COMPS"
  | "IT"
  | "AI-DS"
  | "EXTC"
  | "MECH"
  | "CIVIL";

export type AcademicSemester = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type DocumentCategory = "pyq" | "notes" | "syllabus" | "solution";

export type ModerationStatus = "pending" | "approved" | "rejected";

export type AcademicScheme = "Rev-2019 C Scheme";

export interface Resource {
  id: string;
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
  uploader_name: string; // e.g. "Admin (CODEBITS)" or verified student name
  uploader_role?: "student" | "admin";
  status: ModerationStatus;
  view_count: number;
  created_at: string;
  updated_at?: string;
}

export interface ResourceFilters {
  branch?: AcademicBranch | "ALL";
  semester?: AcademicSemester | "ALL";
  category?: DocumentCategory | "ALL";
  searchQuery?: string;
}
