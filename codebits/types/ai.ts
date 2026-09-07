/**
 * CodeBits Portal - cbAI Domain Types & State Models
 */

import { AcademicBranch, AcademicSemester, DocumentCategory } from "./resources";

export interface CbAiQuery {
  branch?: AcademicBranch;
  semester?: AcademicSemester;
  subject?: string;
  category?: DocumentCategory;
}

export type CbAiStatus =
  | "idle"
  | "focused"
  | "typing"
  | "searching"
  | "results"
  | "no_results"
  | "error";

export interface CbAiResponse {
  query: CbAiQuery;
  message?: string;
  resultsCount: number;
}
