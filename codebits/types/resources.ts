/**
 * CodeBits Portal - Academic Catalog & Resource Domain Types
 * Specific to Mumbai University engineering.
 */

export type AcademicBranch =
  | "ALL"
  | "COMPS"
  | "IT"
  | "AI-DS"
  | "EXTC"
  | "MECH"
  | "CIVIL";

export type AcademicSemester = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type DocumentCategory = "pyq" | "notes" | "syllabus" | "solution";

export type ModerationStatus = "pending" | "approved" | "rejected";

export type AcademicScheme = "Mumbai University" | "Autonomous" | "General";

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
  gridfs_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface ResourceFilters {
  branch?: AcademicBranch | "ALL";
  semester?: AcademicSemester | "ALL";
  category?: DocumentCategory | "ALL";
  searchQuery?: string;
}

export type SyllabusSubjectType = 'theory' | 'practical' | 'both' | 'project';

export interface SyllabusSubject {
  code: string; // e.g. "CSC301"
  name: string; // e.g. "Applied Mathematics-III"
  type: SyllabusSubjectType; // 'theory' | 'practical' | 'both' | 'project'
  teachingScheme: {
    lectures: number | string; // e.g. 3 or "-"
    practicals: number | string; // e.g. 2 or "-"
    tutorials: number | string; // e.g. 1 or "-"
    credits: number | string; // e.g. 4
  };
  examScheme: {
    internalAssessment: number | string; // e.g. 20 (Test 1 + Test 2 avg)
    endSemExam: number | string; // e.g. 80
    examDurationHours?: number | string; // e.g. "3h" or "2h"
    termWork: number | string; // e.g. 25 or "-"
    practicalOral: number | string; // e.g. 25 or "-"
    totalMarks: number | string; // e.g. 100, 125, 150
  };
  summary?: string; // Quick note on topics / objectives
}

export interface SyllabusOverviewData {
  resourceId: string;
  schemeTitle: string; // e.g. "Mumbai University Rev-2019 'C' Scheme / NEP"
  branch: AcademicBranch | string;
  semester: AcademicSemester | number;
  totalCredits: number | string;
  totalMarks: number | string;
  theorySubjectsCount: number;
  practicalLabsCount: number;
  bothCount: number;
  subjects: SyllabusSubject[];
  passingRules?: string; // Summary of passing criteria (e.g. 40% aggregate in ESE and IA)
  notes?: string[];
  generatedAt: string;
}
