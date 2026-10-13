import { COLLEGES, CMAP, College, BranchCutoff } from '@/data/cap_data';

export type MatchBand = 'Safe' | 'Target' | 'Ambitious' | 'Reach' | 'Dream';

export interface PredictionResult {
  college: College;
  branch: BranchCutoff;
  cutoff: number;
  diff: number;
  band: MatchBand;
  bandColor: string;
  bandBg: string;
  bandBorder: string;
  roundCutoffs: {
    round1?: number;
    round2?: number;
    round3?: number;
    round4?: number;
  };
  appliedQuota: string;
  netFee: number;
  feeSavingsNote: string;
  isMinorityOnly?: boolean;
}

export function getRndCut(
  br: BranchCutoff,
  cat: string,
  isFemale: boolean,
  round: number
): number | null {
  const map = CMAP[cat] || CMAP['OPEN'];
  if (isFemale) {
    const fk = `f${round}`;
    if (map[fk] && br[map[fk]] !== undefined) {
      return br[map[fk]] as number;
    }
  }

  const rk = `r${round}`;
  if (map[rk] && br[map[rk]] !== undefined) {
    return br[map[rk]] as number;
  }

  // Fallback to open
  const openKeys = [`${round}g`, `${round}gh`];
  const femKeys = [`${round}l`, `${round}lh`];
  if (isFemale) {
    for (const k of femKeys) {
      if (br[k] !== undefined) return br[k] as number;
    }
  }
  for (const k of openKeys) {
    if (br[k] !== undefined) return br[k] as number;
  }

  // Any round fallback
  const fallback = ['4g', '1g', '4gh', '1gh'];
  for (const k of fallback) {
    if (br[k] !== undefined) return br[k] as number;
  }

  return null;
}

export function getEffectiveCutoff(
  br: BranchCutoff,
  cat: string,
  isFemale: boolean
): { cutoff: number; round: number } | null {
  const map = CMAP[cat] || CMAP['OPEN'];
  if (isFemale) {
    for (let r = 4; r >= 1; r--) {
      const k = `f${r}`;
      if (map[k] && br[map[k]] !== undefined) {
        return { cutoff: br[map[k]] as number, round: r };
      }
    }
  }
  for (let r = 4; r >= 1; r--) {
    const k = `r${r}`;
    if (map[k] && br[map[k]] !== undefined) {
      return { cutoff: br[map[k]] as number, round: r };
    }
  }

  // Fallback to open
  for (let r = 4; r >= 1; r--) {
    const k = `${r}g`;
    if (br[k] !== undefined) return { cutoff: br[k] as number, round: r };
  }
  return null;
}

export function getMatchBand(diff: number): {
  band: MatchBand;
  bandColor: string;
  bandBg: string;
  bandBorder: string;
} {
  if (diff >= 3.0) {
    return {
      band: 'Safe',
      bandColor: '#00C269',
      bandBg: 'rgba(0, 194, 105, 0.1)',
      bandBorder: 'rgba(0, 194, 105, 0.3)',
    };
  }
  if (diff >= 0.0) {
    return {
      band: 'Target',
      bandColor: '#38BDF8',
      bandBg: 'rgba(56, 189, 248, 0.1)',
      bandBorder: 'rgba(56, 189, 248, 0.3)',
    };
  }
  if (diff >= -3.0) {
    return {
      band: 'Ambitious',
      bandColor: '#F59E0B',
      bandBg: 'rgba(245, 158, 11, 0.1)',
      bandBorder: 'rgba(245, 158, 11, 0.3)',
    };
  }
  if (diff >= -8.0) {
    return {
      band: 'Reach',
      bandColor: '#A855F7',
      bandBg: 'rgba(168, 85, 247, 0.1)',
      bandBorder: 'rgba(168, 85, 247, 0.3)',
    };
  }
  return {
    band: 'Dream',
    bandColor: '#94A3B8',
    bandBg: 'rgba(148, 163, 184, 0.1)',
    bandBorder: 'rgba(148, 163, 184, 0.25)',
  };
}

export function calculateNetFee(
  totalFee: number,
  category: string
): { netFee: number; note: string } {
  const f = totalFee || 0;
  if (f === 0) return { netFee: 0, note: 'Govt. Sponsored' };

  if (category === 'SC' || category === 'ST' || category === 'TFWS') {
    // 100% tuition fee waiver, only nominal dev fee/exam fee
    const devFee = Math.round(f * 0.12);
    return {
      netFee: devFee,
      note: '100% Tuition Waiver (Govt. Scholarship / TFWS)',
    };
  }

  if (category === 'OBC' || category === 'SEBC' || category === 'EWS') {
    // 50% tuition waiver (approx 42-45% of total fee)
    const net = Math.round(f * 0.55);
    return {
      netFee: net,
      note: '50% Tuition Waiver (Rajarshi Shahu Maharaj Scheme)',
    };
  }

  if (category === 'VJ' || category === 'NT1' || category === 'NT2' || category === 'NT3') {
    const devFee = Math.round(f * 0.12);
    return {
      netFee: devFee,
      note: '100% Tuition Waiver (VJNT Freeship)',
    };
  }

  return { netFee: f, note: 'Standard Open Fee' };
}

export interface PredictParams {
  score: number;
  category: string;
  gender: 'male' | 'female';
  region?: string;
  selectedBranches?: string[];
  minority?: string;
  status?: string; // 'all' | 'govt' | 'autonomous'
  targetRound?: number; // 1 | 2 | 3 | 4
}

export function runPrediction(params: PredictParams): PredictionResult[] {
  const {
    score,
    category,
    gender,
    region,
    selectedBranches = [],
    minority,
    status = 'all',
    targetRound = 4,
  } = params;

  const isFemale = gender === 'female';
  const results: PredictionResult[] = [];

  for (const col of COLLEGES) {
    // Filter minority
    if (minority && (!col.mi || !col.mi.toLowerCase().includes(minority.toLowerCase()))) {
      continue;
    }

    // Filter region
    if (region && region !== 'all') {
      const cr = (col.r || '').toLowerCase();
      const cc = (col.ci || '').toLowerCase();
      const rLower = region.toLowerCase();
      if (!cr.includes(rLower) && !cc.includes(rLower)) {
        continue;
      }
    }

    // Filter status
    if (status === 'govt' && col.st !== 'govt') continue;
    if (status === 'autonomous' && col.a !== 1) continue;

    for (const br of col.br) {
      // Filter branches if selected
      if (selectedBranches.length > 0) {
        const brNameLower = br.n.toLowerCase();
        const matches = selectedBranches.some((b) =>
          brNameLower.includes(b.toLowerCase())
        );
        if (!matches) continue;
      }

      // Cutoff for selected round or overall
      const cut = getRndCut(br, category, isFemale, targetRound);
      if (cut === null || cut === undefined || cut <= 0) continue;

      const diff = Number((score - cut).toFixed(2));
      const { band, bandColor, bandBg, bandBorder } = getMatchBand(diff);

      const r1Cut = getRndCut(br, category, isFemale, 1) || undefined;
      const r2Cut = getRndCut(br, category, isFemale, 2) || undefined;
      const r3Cut = getRndCut(br, category, isFemale, 3) || undefined;
      const r4Cut = getRndCut(br, category, isFemale, 4) || undefined;

      const feeCalc = calculateNetFee(col.f || 0, category);

      results.push({
        college: col,
        branch: br,
        cutoff: cut,
        diff,
        band,
        bandColor,
        bandBg,
        bandBorder,
        roundCutoffs: {
          round1: r1Cut,
          round2: r2Cut,
          round3: r3Cut,
          round4: r4Cut,
        },
        appliedQuota: isFemale ? `${category} (Ladies Quota)` : category,
        netFee: feeCalc.netFee,
        feeSavingsNote: feeCalc.note,
      });
    }
  }

  // Sort: closest match to user's score first, then high cutoffs
  return results.sort((a, b) => {
    // Sort by diff proximity to 0
    const absA = Math.abs(a.diff);
    const absB = Math.abs(b.diff);
    if (absA !== absB) return absA - absB;
    return b.cutoff - a.cutoff;
  });
}
