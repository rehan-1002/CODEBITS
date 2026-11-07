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

const MU_ACRONYMS: Record<string, string> = {
  BEE: 'Basic Electrical & Electronics Engineering',
  'AM-1': 'Applied Mathematics-I',
  AM1: 'Applied Mathematics-I',
  'AM-2': 'Applied Mathematics-II',
  AM2: 'Applied Mathematics-II',
  'AM-3': 'Applied Mathematics-III',
  AM3: 'Applied Mathematics-III',
  'AM-4': 'Applied Mathematics-IV',
  AM4: 'Applied Mathematics-IV',
  DLDA: 'Digital Logic & Computer Architecture (DLDA)',
  DLCA: 'Digital Logic & Computer Architecture (DLCA)',
  DS: 'Data Structures',
  DSA: 'Data Structures & Algorithms',
  DBMS: 'Database Management Systems',
  OS: 'Operating Systems',
  CN: 'Computer Networks',
  CG: 'Computer Graphics',
  AOA: 'Analysis of Algorithms',
  TCS: 'Theoretical Computer Science',
  SE: 'Software Engineering',
  AI: 'Artificial Intelligence',
  ML: 'Machine Learning',
  CSS: 'Cryptography & System Security',
  CNS: 'Cryptography & Network Security',
  IP: 'Internet Programming',
  SPA: 'Structured Programming Approach (C Programming)',
  EM: 'Engineering Mechanics',
  'EP-1': 'Applied Physics-I',
  EP1: 'Applied Physics-I',
  'EP-2': 'Applied Physics-II',
  EP2: 'Applied Physics-II',
  'EC-1': 'Applied Chemistry-I',
  EC1: 'Applied Chemistry-I',
  'EC-2': 'Applied Chemistry-II',
  EC2: 'Applied Chemistry-II',
  EVS: 'Environmental Studies',
  EG: 'Engineering Graphics & Design',
};

export function formatQuestionPaperMetadata(qp: Partial<IQuestionPaper>) {
  let subject = (qp.subject || '').trim();
  let year = qp.year && qp.year !== 'Unknown' ? qp.year : '';
  let session = qp.session && qp.session !== 'EXAM' ? qp.session : '';
  let scheme = qp.scheme || 'Mumbai University';
  const isNep = Boolean(qp.isNep || (scheme && scheme.toUpperCase().includes('NEP')));

  // Check if subject is an encoded filename like "FE_SEM1_BEE CBCGS_DEC16" or "SE Comps_SEM4_CG_MAY19"
  const fileCodeMatch = subject.match(
    /(?:(?:FE|SE|TE|BE)[_\s]+(?:SEM\d?)[_\s]+)?([A-Za-z0-9\s&-]+?)(?:[_\s]+(CBCGS|CBSGS|REV|C-Scheme|NEP))?[_\s]+(DEC|MAY|NOV|JUN|JUL|JAN|OCT|APR)[_-]?(\d{2,4})/i
  );

  if (fileCodeMatch) {
    const rawSubj = fileCodeMatch[1].trim();
    const rawScheme = fileCodeMatch[2];
    const rawMonth = fileCodeMatch[3].toUpperCase();
    let rawYr = fileCodeMatch[4];

    if (rawYr.length === 2) {
      rawYr = (parseInt(rawYr, 10) > 80 ? '19' : '20') + rawYr;
    }

    if (!year || year === 'Unknown') year = rawYr;
    if (!session || session === 'EXAM') session = rawMonth === 'DEC' ? 'DECEMBER' : rawMonth === 'MAY' ? 'MAY' : rawMonth;
    if ((!scheme || scheme === 'Other') && rawScheme) scheme = rawScheme.toUpperCase();

    const cleanSubj = rawSubj.replace(/^_+|_+$/g, '').trim();
    if (MU_ACRONYMS[cleanSubj.toUpperCase()]) {
      subject = MU_ACRONYMS[cleanSubj.toUpperCase()];
    } else {
      subject = cleanSubj;
    }
  }

  // Capitalize Subject title cleanly
  subject = subject.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();

  let displayScheme = scheme;
  if (isNep) {
    displayScheme = 'NEP-2020';
  } else if (scheme === 'Other' || !scheme) {
    displayScheme = 'Mumbai University';
  }

  // Title structure
  const parts: string[] = [];
  if (isNep) {
    parts.push('NEP-2020');
  } else if (displayScheme && displayScheme !== 'Mumbai University') {
    parts.push(displayScheme);
  }
  parts.push(subject);

  const timePart = [session, year].filter(Boolean).join(' ');
  if (timePart) {
    parts.push(`(${timePart})`);
  }

  const title = `MU | ${parts.join(' | ')}`;

  return {
    title,
    subject,
    scheme: displayScheme,
    year,
    session,
    isNep,
  };
}

export const QuestionPaperModel: Model<IQuestionPaper> =
  mongoose.models.QuestionPaper ||
  mongoose.model<IQuestionPaper>('QuestionPaper', QuestionPaperSchema, 'question_papers');

