/**
 * Publication-Grade Vector SVG Venn Diagram Generator
 * Generates mathematically accurate 2-Set and 3-Set Venn Diagrams with shaded regions,
 * universal set boundaries, set labels, and styled captions.
 */

export interface VennRegionConfig {
  title: string;
  sets: ("A" | "B" | "C")[];
  type: "2-set" | "3-set";
  expression: string;
}

/**
 * Normalizes user/OCR expressions into standard mathematical set notation.
 */
export function normalizeSetExpression(raw: string): string {
  if (!raw) return "";
  let s = raw.trim();
  s = s.replace(/\\setminus\b/g, "∖");
  s = s.replace(/\bsetminus\b/gi, "∖");
  s = s.replace(/\bset minus\b/gi, "∖");
  s = s.replace(/\\oplus\b/g, "⊕");
  s = s.replace(/\boplus\b/gi, "⊕");
  s = s.replace(/\\cup\b/g, "∪");
  s = s.replace(/\\cap\b/g, "∩");
  s = s.replace(/\\overline\{([A-Za-z])\}/g, "$1̄");
  s = s.replace(/\boverline([A-Za-z])\b/g, "$1̄");
  s = s.replace(/\\/g, "∖");
  return s.trim();
}

/**
 * Determines whether an expression involves 3 sets (A, B, C) or 2 sets (A, B / B, C).
 */
export function analyzeSetExpression(expr: string): { isThreeSet: boolean; normalized: string } {
  const norm = normalizeSetExpression(expr);
  const hasC = /\bC\b|∩\s*C|∪\s*C|∖\s*C|C̄/.test(norm);
  const hasA = /\bA\b|A\s*∩|A\s*∪|A\s*∖|Ā/.test(norm);
  const hasB = /\bB\b|B\s*∩|B\s*∪|B\s*∖|B̄/.test(norm);

  const isThreeSet = hasC || (hasA && hasB && hasC);
  return { isThreeSet, normalized: norm };
}

/**
 * Generates clean, crisp 2-Set Venn Diagram SVG (Sets A and B, or B and C)
 */
export function generate2SetVennSvg(expression: string, customTitle?: string): string {
  const title = customTitle || normalizeSetExpression(expression);
  const width = 380;
  const height = 250;

  // Geometry: Circle 1 at (145, 115), Circle 2 at (235, 115), r = 65
  const c1x = 145;
  const c1y = 115;
  const c2x = 235;
  const c2y = 115;
  const r = 65;

  const set1Label = /B\s*∖\s*C|B\s*∩\s*C|B\s*∪\s*C/.test(title) ? "B" : "A";
  const set2Label = /B\s*∖\s*C|B\s*∩\s*C|B\s*∪\s*C/.test(title) ? "C" : "B";

  // Determine which region to shade
  const isDiff1Minus2 = new RegExp(`${set1Label}\\s*∖\\s*${set2Label}|${set1Label}\\s*-\\s*${set2Label}`, "i").test(title);
  const isDiff2Minus1 = new RegExp(`${set2Label}\\s*∖\\s*${set1Label}|${set2Label}\\s*-\\s*${set1Label}`, "i").test(title);
  const isIntersection = /∩/.test(title) && !/∪|∖/.test(title);
  const isUnion = /∪/.test(title) && !/∩|∖|'|̄/.test(title);
  const isSymDiff = /⊕|\\Delta|symdiff/i.test(title);
  const isComplementUnion = /'|̄/.test(title) && /∪/.test(title);

  // SVG Mask / Path definitions
  let shadedPath = "";

  if (isDiff1Minus2) {
    // Set 1 minus Set 2 (crescent on the left)
    shadedPath = `
      <mask id="diff1">
        <rect width="${width}" height="${height}" fill="white" />
        <circle cx="${c2x}" cy="${c2y}" r="${r}" fill="black" />
      </mask>
      <circle cx="${c1x}" cy="${c1y}" r="${r}" fill="#00C269" fill-opacity="0.45" stroke="#00A859" stroke-width="2.5" mask="url(#diff1)" />
    `;
  } else if (isDiff2Minus1) {
    // Set 2 minus Set 1 (crescent on the right)
    shadedPath = `
      <mask id="diff2">
        <rect width="${width}" height="${height}" fill="white" />
        <circle cx="${c1x}" cy="${c1y}" r="${r}" fill="black" />
      </mask>
      <circle cx="${c2x}" cy="${c2y}" r="${r}" fill="#00C269" fill-opacity="0.45" stroke="#00A859" stroke-width="2.5" mask="url(#diff2)" />
    `;
  } else if (isIntersection) {
    // Intersection lens
    shadedPath = `
      <clipPath id="clip1">
        <circle cx="${c1x}" cy="${c1y}" r="${r}" />
      </clipPath>
      <circle cx="${c2x}" cy="${c2y}" r="${r}" fill="#00C269" fill-opacity="0.55" stroke="#00A859" stroke-width="2.5" clip-path="url(#clip1)" />
    `;
  } else if (isUnion) {
    // Union: both circles
    shadedPath = `
      <circle cx="${c1x}" cy="${c1y}" r="${r}" fill="#00C269" fill-opacity="0.40" />
      <circle cx="${c2x}" cy="${c2y}" r="${r}" fill="#00C269" fill-opacity="0.40" />
    `;
  } else if (isSymDiff) {
    // Symmetric Difference (A ⊕ B): both crescents
    shadedPath = `
      <mask id="sym1">
        <rect width="${width}" height="${height}" fill="white" />
        <circle cx="${c2x}" cy="${c2y}" r="${r}" fill="black" />
      </mask>
      <circle cx="${c1x}" cy="${c1y}" r="${r}" fill="#00C269" fill-opacity="0.45" mask="url(#sym1)" />
      <mask id="sym2">
        <rect width="${width}" height="${height}" fill="white" />
        <circle cx="${c1x}" cy="${c1y}" r="${r}" fill="black" />
      </mask>
      <circle cx="${c2x}" cy="${c2y}" r="${r}" fill="#00C269" fill-opacity="0.45" mask="url(#sym2)" />
    `;
  } else if (isComplementUnion) {
    // (A ∪ B)': outside both circles
    shadedPath = `
      <mask id="compUnion">
        <rect width="${width}" height="${height}" fill="white" />
        <circle cx="${c1x}" cy="${c1y}" r="${r}" fill="black" />
        <circle cx="${c2x}" cy="${c2y}" r="${r}" fill="black" />
      </mask>
      <rect x="15" y="15" width="${width - 30}" height="${height - 45}" rx="8" fill="#00C269" fill-opacity="0.45" mask="url(#compUnion)" />
    `;
  } else {
    // Default: gentle highlight on circle 1
    shadedPath = `
      <circle cx="${c1x}" cy="${c1y}" r="${r}" fill="#00C269" fill-opacity="0.30" />
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <!-- Universal Set U Background -->
  <rect x="15" y="15" width="${width - 30}" height="${height - 45}" rx="8" fill="#F8FAFC" stroke="#94A3B8" stroke-width="2"/>
  
  <!-- Universal Set U Label -->
  <text x="32" y="42" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="18" font-weight="bold" fill="#475569">U</text>
  
  <!-- Shaded Operation Region -->
  ${shadedPath}
  
  <!-- Circle Outlines -->
  <circle cx="${c1x}" cy="${c1y}" r="${r}" fill="none" stroke="#2563EB" stroke-width="2.5" />
  <circle cx="${c2x}" cy="${c2y}" r="${r}" fill="none" stroke="#D97706" stroke-width="2.5" />
  
  <!-- Set Labels -->
  <text x="${c1x - 35}" y="${c1y - 35}" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="17" font-weight="bold" fill="#1E40AF">${set1Label}</text>
  <text x="${c2x + 25}" y="${c2y - 35}" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="17" font-weight="bold" fill="#B45309">${set2Label}</text>
  
  <!-- Title / Set Expression Caption -->
  <rect x="25" y="${height - 28}" width="${width - 50}" height="24" rx="4" fill="#E2E8F0" />
  <text x="${width / 2}" y="${height - 12}" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle" fill="#007038">${title}</text>
</svg>`;
}

/**
 * Generates clean, crisp 3-Set Venn Diagram SVG (Sets A, B, and C)
 */
export function generate3SetVennSvg(expression: string, customTitle?: string): string {
  const title = customTitle || normalizeSetExpression(expression);
  const width = 420;
  const height = 320;

  // Geometry:
  // Circle A (top-left): (175, 125), r = 62
  // Circle B (top-right): (245, 125), r = 62
  // Circle C (bottom-center): (210, 185), r = 62
  const ax = 175, ay = 125;
  const bx = 245, by = 125;
  const cx = 210, cy = 185;
  const r = 62;

  const norm = title.toLowerCase();

  // Region Identification
  let shadedPath = "";

  if (norm.includes("a ∩ b ∩ c") || norm.includes("a∩b∩c")) {
    // 3-way center intersection
    shadedPath = `
      <clipPath id="clipA"><circle cx="${ax}" cy="${ay}" r="${r}" /></clipPath>
      <clipPath id="clipB"><circle cx="${bx}" cy="${by}" r="${r}" /></clipPath>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#00C269" fill-opacity="0.65" stroke="#00A859" stroke-width="2.5" clip-path="url(#clipA)" />
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#00C269" fill-opacity="0.65" clip-path="url(#clipB)" />
    `;
  } else if (norm.includes("b ∖ c") || norm.includes("b - c") || norm.includes("bsetminus c")) {
    // B minus C
    shadedPath = `
      <mask id="bMinusC">
        <rect width="${width}" height="${height}" fill="white" />
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="black" />
      </mask>
      <circle cx="${bx}" cy="${by}" r="${r}" fill="#00C269" fill-opacity="0.45" stroke="#00A859" stroke-width="2" mask="url(#bMinusC)" />
    `;
  } else if (norm.includes("a ∖ (b ∖ c)") || norm.includes("a - (b - c)") || norm.includes("a ∖ (b - c)")) {
    // A minus (B minus C): Circle A without the part of B that is outside C!
    shadedPath = `
      <mask id="aMinusBMinusC">
        <rect width="${width}" height="${height}" fill="white" />
        <!-- Cut out (B minus C) from A -->
        <g mask="url(#onlyBMinusC)">
          <circle cx="${bx}" cy="${by}" r="${r}" fill="black" />
        </g>
      </mask>
      <mask id="onlyBMinusC">
        <rect width="${width}" height="${height}" fill="white" />
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="black" />
      </mask>
      <circle cx="${ax}" cy="${ay}" r="${r}" fill="#00C269" fill-opacity="0.45" mask="url(#aMinusBMinusC)" />
      <!-- Re-add A ∩ B ∩ C if needed because it's inside C -->
      <clipPath id="clipA"><circle cx="${ax}" cy="${ay}" r="${r}" /></clipPath>
      <clipPath id="clipB"><circle cx="${bx}" cy="${by}" r="${r}" /></clipPath>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#00C269" fill-opacity="0.45" clip-path="url(#clipA)" />
    `;
  } else if (norm.includes("(a ∖ b) ∪ (a ∩ b ∩ c)") || norm.includes("(a - b) u (a ∩ b ∩ c)")) {
    // (A minus B) UNION (A ∩ B ∩ C)
    shadedPath = `
      <mask id="aMinusB">
        <rect width="${width}" height="${height}" fill="white" />
        <circle cx="${bx}" cy="${by}" r="${r}" fill="black" />
      </mask>
      <circle cx="${ax}" cy="${ay}" r="${r}" fill="#00C269" fill-opacity="0.45" mask="url(#aMinusB)" />
      <!-- Central intersection A ∩ B ∩ C -->
      <clipPath id="clipA3"><circle cx="${ax}" cy="${ay}" r="${r}" /></clipPath>
      <clipPath id="clipB3"><circle cx="${bx}" cy="${by}" r="${r}" /></clipPath>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#00C269" fill-opacity="0.45" clip-path="url(#clipA3)" />
    `;
  } else if (norm.includes("a ∖ b") || norm.includes("a - b")) {
    // A minus B
    shadedPath = `
      <mask id="aMinusBOnly">
        <rect width="${width}" height="${height}" fill="white" />
        <circle cx="${bx}" cy="${by}" r="${r}" fill="black" />
      </mask>
      <circle cx="${ax}" cy="${ay}" r="${r}" fill="#00C269" fill-opacity="0.45" stroke="#00A859" stroke-width="2" mask="url(#aMinusBOnly)" />
    `;
  } else if (norm.includes("a ∪ b ∪ c")) {
    // Union of all three
    shadedPath = `
      <circle cx="${ax}" cy="${ay}" r="${r}" fill="#00C269" fill-opacity="0.38" />
      <circle cx="${bx}" cy="${by}" r="${r}" fill="#00C269" fill-opacity="0.38" />
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#00C269" fill-opacity="0.38" />
    `;
  } else if (norm.includes("a ∩ b")) {
    // A ∩ B
    shadedPath = `
      <clipPath id="clipA_AB"><circle cx="${ax}" cy="${ay}" r="${r}" /></clipPath>
      <circle cx="${bx}" cy="${by}" r="${r}" fill="#00C269" fill-opacity="0.55" clip-path="url(#clipA_AB)" />
    `;
  } else {
    // Default: Highlight Set A
    shadedPath = `
      <circle cx="${ax}" cy="${ay}" r="${r}" fill="#00C269" fill-opacity="0.35" />
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <!-- Universal Set U Background -->
  <rect x="15" y="15" width="${width - 30}" height="${height - 45}" rx="8" fill="#F8FAFC" stroke="#94A3B8" stroke-width="2"/>
  
  <!-- Universal Set U Label -->
  <text x="32" y="42" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="18" font-weight="bold" fill="#475569">U</text>
  
  <!-- Shaded Active Region -->
  ${shadedPath}
  
  <!-- Circle Outlines -->
  <circle cx="${ax}" cy="${ay}" r="${r}" fill="none" stroke="#2563EB" stroke-width="2.5" />
  <circle cx="${bx}" cy="${by}" r="${r}" fill="none" stroke="#D97706" stroke-width="2.5" />
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#7C3AED" stroke-width="2.5" />
  
  <!-- Set Labels -->
  <text x="${ax - 38}" y="${ay - 30}" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="17" font-weight="bold" fill="#1E40AF">A</text>
  <text x="${bx + 28}" y="${by - 30}" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="17" font-weight="bold" fill="#B45309">B</text>
  <text x="${cx - 6}" y="${cy + r + 24}" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="17" font-weight="bold" fill="#6D28D9">C</text>
  
  <!-- Title / Set Expression Caption -->
  <rect x="25" y="${height - 28}" width="${width - 50}" height="24" rx="4" fill="#E2E8F0" />
  <text x="${width / 2}" y="${height - 12}" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle" fill="#007038">${title}</text>
</svg>`;
}

/**
 * Universal dispatcher: creates an appropriate 2-set or 3-set Venn diagram based on expression.
 */
export function generateVennSvg(expression: string, customTitle?: string): string {
  const { isThreeSet, normalized } = analyzeSetExpression(expression);
  if (isThreeSet) {
    return generate3SetVennSvg(normalized, customTitle);
  }
  return generate2SetVennSvg(normalized, customTitle);
}

