import fs from 'fs';
import path from 'path';

const sourceFile = 'C:\\Users\\ASUS HN116WS\\.gemini\\antigravity-ide\\brain\\43ce454b-ace4-4f72-bac7-515344d7a91f\\.system_generated\\steps\\111\\content.md';
const content = fs.readFileSync(sourceFile, 'utf-8');

// Match CDATA
const cdataMatch = content.match(/(?:var|let|const)\s+CDATA\s*=\s*(\[[\s\S]*?\]);/);
if (!cdataMatch) {
  throw new Error('CDATA not found');
}

// Match CMAP
const cmapMatch = content.match(/(?:var|let|const)\s+CMAP\s*=\s*(\{[\s\S]*?\n\s*\});/);
if (!cmapMatch) {
  throw new Error('CMAP not found');
}

// Safely evaluate using Function in node
const CDATA = new Function(`return ${cdataMatch[1]}`)();
const CMAP = new Function(`return ${cmapMatch[1]}`)();

console.log(`Extracted ${CDATA.length} colleges and ${Object.keys(CMAP).length} CMAP categories`);

const outDir = path.resolve('data');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const tsContent = `// Official State Common Entrance Test Cell & Fee Regulating Authority (FRA) Data
// 372 Engineering Colleges & 2,280+ Branch Cutoffs across CAP Rounds I-IV

export interface BranchCutoff {
  n: string; // Branch name
  [key: string]: any;
}

export interface College {
  c: string; // College code (e.g., '01002')
  n: string; // College name
  r?: string; // Region
  ci?: string; // City
  u?: string; // University
  st?: string; // Status ('govt', 'unaided', 'university')
  na?: string; // NAAC rating
  p?: string; // Placements avg
  f?: number; // Total annual fee in INR
  tf?: number; // Tuition fee
  df?: number; // Development fee
  fd?: any; // Fee description
  a?: number; // Autonomous (1 = yes)
  h?: number; // Hostel (1 = yes)
  d?: string; // District
  i?: number; // Total intake
  mi?: string; // Minority status if any
  br: BranchCutoff[];
  [key: string]: any;
}

export const CMAP: Record<string, Record<string, string>> = ${JSON.stringify(CMAP, null, 2)};

export const COLLEGES: College[] = ${JSON.stringify(CDATA, null, 2)};
`;

const targetPath = path.join(outDir, 'cap_data.ts');
fs.writeFileSync(targetPath, tsContent, 'utf-8');
console.log(`Saved ${fs.statSync(targetPath).size} bytes to ${targetPath}`);
