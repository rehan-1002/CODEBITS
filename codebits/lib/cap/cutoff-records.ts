import { COLLEGES, College, BranchCutoff } from '@/data/cap_data';

export interface CategoryDefinition {
  id: string;
  code: string;
  label: string;
  description: string;
  hasLadies: boolean;
  generalKey: string;
  ladiesKey?: string;
  waiverInfo: string;
}

export const CUTOFF_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'OPEN',
    code: 'g',
    label: 'Open / General',
    description: 'General State Merit Seats (Non-reserved)',
    hasLadies: true,
    generalKey: 'g',
    ladiesKey: 'l',
    waiverInfo: 'Standard open fee, EBC scholarship eligible if income < 8 LPA',
  },
  {
    id: 'OBC',
    code: 'b',
    label: 'OBC (Other Backward Classes)',
    description: '19% State Quota (NCL Certificate Required)',
    hasLadies: true,
    generalKey: 'b',
    ladiesKey: 'lb',
    waiverInfo: '50% Tuition Fee Waiver under Rajarshi Shahu Maharaj Scheme',
  },
  {
    id: 'EWS',
    code: 'ew',
    label: 'EWS (Economically Weaker Section)',
    description: '10% State Supernumerary Quota (Family income < 8 LPA)',
    hasLadies: false,
    generalKey: 'ew',
    waiverInfo: '50% Tuition Fee Waiver through state treasury subsidy',
  },
  {
    id: 'TFWS',
    code: 'tf',
    label: 'TFWS (Tuition Fee Waiver Scheme)',
    description: '5% Supernumerary Seats per Branch (Merit-based, income < 8 LPA)',
    hasLadies: false,
    generalKey: 'tf',
    waiverInfo: '100% Tuition Fee Waived (pay only nominal development fee)',
  },
  {
    id: 'SC',
    code: 's',
    label: 'SC (Scheduled Caste)',
    description: '13% State Quota (Caste Validity Required)',
    hasLadies: true,
    generalKey: 's',
    ladiesKey: 'ls',
    waiverInfo: '100% Tuition & Development Fee Waiver (Govt. Post-Matric Freeship)',
  },
  {
    id: 'ST',
    code: 't',
    label: 'ST (Scheduled Tribe)',
    description: '7% State Quota (Tribe Validity Required)',
    hasLadies: true,
    generalKey: 't',
    ladiesKey: 'lt',
    waiverInfo: '100% Tuition & Development Fee Waiver (Tribal Development Dept)',
  },
  {
    id: 'SEBC',
    code: 'e',
    label: 'SEBC (Socially & Educationally Backward)',
    description: '10% Reservation Quota (Valid NCL Required)',
    hasLadies: true,
    generalKey: 'e',
    ladiesKey: 'le',
    waiverInfo: '50% Tuition Fee Waiver under state backward category schemes',
  },
  {
    id: 'VJ',
    code: 'vj',
    label: 'VJ / DT (Vimukta Jati / Denotified Tribes)',
    description: '3% State Quota (VJ/DT-A)',
    hasLadies: true,
    generalKey: 'vj',
    ladiesKey: 'lvj',
    waiverInfo: '100% Tuition Fee Waiver (VJNT Freeship Scheme)',
  },
  {
    id: 'NT1',
    code: 'n1',
    label: 'NT-1 (NT-B)',
    description: '2.5% State Quota (Nomadic Tribes 1)',
    hasLadies: true,
    generalKey: 'n1',
    ladiesKey: 'ln1',
    waiverInfo: '100% Tuition Fee Waiver (VJNT Freeship Scheme)',
  },
  {
    id: 'NT2',
    code: 'n2',
    label: 'NT-2 (NT-C)',
    description: '3.5% State Quota (Nomadic Tribes 2 - Dhangar)',
    hasLadies: true,
    generalKey: 'n2',
    ladiesKey: 'ln2',
    waiverInfo: '100% Tuition Fee Waiver (VJNT Freeship Scheme)',
  },
  {
    id: 'NT3',
    code: 'n3',
    label: 'NT-3 (NT-D)',
    description: '2% State Quota (Nomadic Tribes 3 - Vanjari)',
    hasLadies: true,
    generalKey: 'n3',
    ladiesKey: 'ln3',
    waiverInfo: '100% Tuition Fee Waiver (VJNT Freeship Scheme)',
  },
  {
    id: 'DEF',
    code: 'df',
    label: 'DEF (Defense Quota)',
    description: '5% Quota for Children of Ex-Servicemen & Active Defense Personnel',
    hasLadies: false,
    generalKey: 'df',
    waiverInfo: 'Defense personnel welfare concessions applicable',
  },
  {
    id: 'PWD',
    code: 'pw',
    label: 'PWD (Persons with Disability)',
    description: '5% Horizontal Reservation (Disability >= 40%)',
    hasLadies: false,
    generalKey: 'pw',
    waiverInfo: 'Social Justice Dept. scholarship grants available',
  },
  {
    id: 'ORPHAN',
    code: 'or',
    label: 'Orphan Quota',
    description: '1% Horizontal Reservation for orphaned students',
    hasLadies: false,
    generalKey: 'or',
    waiverInfo: 'Full institutional state support and fee absorption',
  },
  {
    id: 'MI',
    code: 'mi',
    label: 'Minority Quota',
    description: '51% Religious / Linguistic Minority Quota in aided/unaided institutes',
    hasLadies: false,
    generalKey: 'mi',
    waiverInfo: 'Minority department state scholarships applicable',
  },
  {
    id: 'AI',
    code: 'a',
    label: 'All India (JEE Main Merit)',
    description: '15% All India Quota in unaided colleges based on JEE Main score',
    hasLadies: false,
    generalKey: 'a',
    waiverInfo: 'Standard open merit fee structure',
  },
];

export interface CutoffRowData {
  categoryId: string;
  categoryLabel: string;
  quotaType: 'General' | 'Ladies';
  round1: number | null;
  round2: number | null;
  round3: number | null;
  round4: number | null;
  relaxationDrop: number | null; // e.g. R1 - R4 drop
  effectiveCutoff: number | null;
}

export interface BranchCutoffMatrix {
  branchName: string;
  rows: CutoffRowData[];
  round1OpenGeneral: number | null;
  round4OpenGeneral: number | null;
  round1ObcGeneral: number | null;
  round4ObcGeneral: number | null;
  tfwsCutoff: number | null;
  allIndiaCutoff: number | null;
}

export function extractCutoffsForBranch(
  branch: BranchCutoff,
  categoryFilter: string = 'all',
  quotaFilter: 'all' | 'general' | 'ladies' = 'all'
): CutoffRowData[] {
  const rows: CutoffRowData[] = [];

  const categoriesToProcess =
    categoryFilter === 'all'
      ? CUTOFF_CATEGORIES
      : CUTOFF_CATEGORIES.filter((c) => c.id === categoryFilter);

  for (const cat of categoriesToProcess) {
    // 1. General Quota
    if (quotaFilter === 'all' || quotaFilter === 'general') {
      const isAllIndia = cat.id === 'AI';
      const r1 = isAllIndia ? (branch['a1'] ?? null) : (branch[`1${cat.generalKey}`] ?? null);
      const r2 = isAllIndia ? (branch['a2'] ?? null) : (branch[`2${cat.generalKey}`] ?? null);
      const r3 = isAllIndia ? (branch['a3'] ?? null) : (branch[`3${cat.generalKey}`] ?? null);
      const r4 = isAllIndia ? (branch['a4'] ?? null) : (branch[`4${cat.generalKey}`] ?? null);

      if (r1 !== null || r2 !== null || r3 !== null || r4 !== null) {
        const availableRounds = [r1, r2, r3, r4].filter((v): v is number => v !== null && v > 0);
        const firstVal = r1 ?? availableRounds[0] ?? null;
        const lastVal = r4 ?? r3 ?? r2 ?? r1 ?? null;
        const drop = firstVal !== null && lastVal !== null && firstVal !== lastVal
          ? Number((firstVal - lastVal).toFixed(2))
          : null;

        rows.push({
          categoryId: cat.id,
          categoryLabel: cat.label,
          quotaType: 'General',
          round1: r1,
          round2: r2,
          round3: r3,
          round4: r4,
          relaxationDrop: drop,
          effectiveCutoff: lastVal,
        });
      }
    }

    // 2. Ladies Quota (if applicable)
    if (cat.hasLadies && cat.ladiesKey && (quotaFilter === 'all' || quotaFilter === 'ladies')) {
      const r1 = branch[`1${cat.ladiesKey}`] ?? null;
      const r2 = branch[`2${cat.ladiesKey}`] ?? null;
      const r3 = branch[`3${cat.ladiesKey}`] ?? null;
      const r4 = branch[`4${cat.ladiesKey}`] ?? null;

      if (r1 !== null || r2 !== null || r3 !== null || r4 !== null) {
        const availableRounds = [r1, r2, r3, r4].filter((v): v is number => v !== null && v > 0);
        const firstVal = r1 ?? availableRounds[0] ?? null;
        const lastVal = r4 ?? r3 ?? r2 ?? r1 ?? null;
        const drop = firstVal !== null && lastVal !== null && firstVal !== lastVal
          ? Number((firstVal - lastVal).toFixed(2))
          : null;

        rows.push({
          categoryId: cat.id,
          categoryLabel: `${cat.label} (30% Ladies)`,
          quotaType: 'Ladies',
          round1: r1,
          round2: r2,
          round3: r3,
          round4: r4,
          relaxationDrop: drop,
          effectiveCutoff: lastVal,
        });
      }
    }
  }

  return rows;
}

export function buildBranchMatrix(branch: BranchCutoff): BranchCutoffMatrix {
  const rows = extractCutoffsForBranch(branch, 'all', 'all');

  return {
    branchName: branch.n,
    rows,
    round1OpenGeneral: branch['1g'] ?? null,
    round4OpenGeneral: branch['4g'] ?? branch['1g'] ?? null,
    round1ObcGeneral: branch['1b'] ?? null,
    round4ObcGeneral: branch['4b'] ?? branch['1b'] ?? null,
    tfwsCutoff: branch['1tf'] ?? branch['2tf'] ?? branch['4tf'] ?? null,
    allIndiaCutoff: branch['a1'] ?? branch['a2'] ?? branch['a4'] ?? null,
  };
}

export interface PreparationInsight {
  r1Target: number | null;
  r4Target: number | null;
  expectedDrop: number | null;
  preferenceRecommendation: 'top' | 'middle' | 'safe';
  optionFormRankGuide: string;
  categoryAdvantagePercent: number | null;
  categoryAdvantageNote: string;
  prepActionItem: string;
  feeEstimated: number;
  feeNote: string;
}

export function generatePreparationInsight(
  college: College,
  branch: BranchCutoff,
  selectedCategory: string = 'OPEN',
  isFemale: boolean = false,
  userScore: number = 0
): PreparationInsight {
  const catDef = CUTOFF_CATEGORIES.find((c) => c.id === selectedCategory) || CUTOFF_CATEGORIES[0];
  const key = isFemale && catDef.hasLadies && catDef.ladiesKey ? catDef.ladiesKey : catDef.generalKey;

  const r1 = branch[`1${key}`] ?? branch['1g'] ?? null;
  const r4 = branch[`4${key}`] ?? branch[`3${key}`] ?? branch[`2${key}`] ?? r1 ?? null;
  const openR1 = branch['1g'] ?? null;

  const expectedDrop = r1 !== null && r4 !== null ? Number((r1 - r4).toFixed(2)) : null;

  // Category advantage vs Open R1
  let categoryAdvantagePercent: number | null = null;
  let categoryAdvantageNote = 'Open merit benchmark';
  if (selectedCategory !== 'OPEN' && r1 !== null && openR1 !== null) {
    categoryAdvantagePercent = Number((openR1 - r1).toFixed(2));
    if (categoryAdvantagePercent > 0) {
      categoryAdvantageNote = `${categoryAdvantagePercent}% lower percentile requirement than General Open`;
    } else if (categoryAdvantagePercent < 0) {
      categoryAdvantageNote = `Highly competitive quota (+${Math.abs(categoryAdvantagePercent)}% over Open)`;
    }
  }

  // Option form preference tier
  let preferenceRecommendation: 'top' | 'middle' | 'safe' = 'middle';
  let optionFormRankGuide = 'Include in Choices 6 to 15 (Realistic Target)';
  let prepActionItem = 'Maintain consistent mock score above R1 benchmark';

  const benchmarkScore = r4 ?? r1 ?? 85;
  if (userScore > 0) {
    const margin = userScore - benchmarkScore;
    if (margin >= 3.0) {
      preferenceRecommendation = 'safe';
      optionFormRankGuide = 'Include in Choices 16 to 25 (Guaranteed Safety Net)';
      prepActionItem = 'Your current score comfortably secures this seat across all rounds';
    } else if (margin >= 0.0) {
      preferenceRecommendation = 'middle';
      optionFormRankGuide = 'Include in Choices 6 to 15 (Primary Realistic Target)';
      prepActionItem = 'Focus on locking this option during Round 1 or Round 2 option form';
    } else if (margin >= -3.5) {
      preferenceRecommendation = 'top';
      optionFormRankGuide = 'Include in Choices 1 to 5 (High Value Ambitious Choice)';
      prepActionItem = `Target late round shifts: R3/R4 drop can bridge your ${Math.abs(margin).toFixed(2)}% margin gap`;
    } else {
      preferenceRecommendation = 'top';
      optionFormRankGuide = 'Keep as top aspirational choice (Choices 1 to 3)';
      prepActionItem = `Requires a boost of ${Math.abs(margin).toFixed(2)}% in upcoming test revisions`;
    }
  } else {
    optionFormRankGuide = `Aim for >= ${benchmarkScore.toFixed(2)}% for assured allotment`;
    prepActionItem = `Round 1 cutoff is ${r1 ? r1.toFixed(2) + '%' : 'competitive'}; prepare for Round 3 relaxation`;
  }

  // Fees calculation
  const totalFee = college.f || 0;
  let feeEstimated = totalFee;
  let feeNote = 'Standard Open Fee';

  if (selectedCategory === 'SC' || selectedCategory === 'ST' || selectedCategory === 'TFWS') {
    feeEstimated = Math.round(totalFee * 0.12);
    feeNote = '100% Tuition Fee Waiver';
  } else if (['OBC', 'SEBC', 'EWS'].includes(selectedCategory)) {
    feeEstimated = Math.round(totalFee * 0.55);
    feeNote = '50% Tuition Waiver';
  } else if (['VJ', 'NT1', 'NT2', 'NT3'].includes(selectedCategory)) {
    feeEstimated = Math.round(totalFee * 0.12);
    feeNote = '100% Tuition Waiver (VJNT Freeship)';
  }

  return {
    r1Target: r1,
    r4Target: r4,
    expectedDrop,
    preferenceRecommendation,
    optionFormRankGuide,
    categoryAdvantagePercent,
    categoryAdvantageNote,
    prepActionItem,
    feeEstimated,
    feeNote,
  };
}

