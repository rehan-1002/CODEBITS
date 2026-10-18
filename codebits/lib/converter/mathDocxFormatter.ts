import {
  Paragraph,
  TextRun,
  HeadingLevel,
  Math as DocxMath,
  MathRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  AlignmentType,
  BuilderElement,
} from "docx";

// ==========================================
// 1. MOJIBAKE & CORRUPTED CHARACTER REPAIR
// ==========================================
// Fixes encoding corruption (UTF-8 bytes misread as Windows-1252 / ISO-8859-1)
// and decodes HTML entities often found in PDF/scraped math question banks.
export function repairMojibakeAndHtmlEntities(text: string): string {
  if (!text) return "";

  let s = text;

  // Common UTF-8 Mojibake sequences for mathematical symbols
  const mojibakeMap: [RegExp, string][] = [
    [/âˆš/g, "√"],
    [/âˆ«/g, "∫"],
    [/âˆ‘/g, "∑"],
    [/âˆ/g, "∏"],
    [/âˆž/g, "∞"],
    [/âˆ‚/g, "∂"],
    [/âˆ‡/g, "∇"],
    [/â‰¤/g, "≤"],
    [/â‰¥/g, "≥"],
    [/â‰ /g, "≠"],
    [/â‰ˆ/g, "≈"],
    [/â‰¡/g, "≡"],
    [/Ã—/g, "×"],
    [/Ã·/g, "÷"],
    [/Â±/g, "±"],
    [/âˆ“/g, "∓"],
    [/Â°/g, "°"],
    [/Â·/g, "·"],
    [/â†’/g, "→"],
    [/â†/g, "←"],
    [/â‡’/g, "⇒"],
    [/â‡/g, "⇐"],
    [/â‡”/g, "⇔"],
    [/âˆˆ/g, "∈"],
    [/âˆ‰/g, "∉"],
    [/âˆ©/g, "∩"],
    [/âˆª/g, "∪"],
    [/âŠ‚/g, "⊂"],
    [/âŠ†/g, "⊆"],
    [/âˆ€/g, "∀"],
    [/âˆƒ/g, "∃"],
    [/âˆ´/g, "∴"],
    [/âˆµ/g, "∵"],
    [/âˆ¼/g, "∼"],
    [/â‰…/g, "≅"],
    [/âŠ¥/g, "⊥"],
    [/âˆ¥/g, "∥"],
    // Greek letters mojibake
    [/Î±/g, "α"],
    [/Î²/g, "β"],
    [/Î³/g, "γ"],
    [/Î´/g, "δ"],
    [/Îµ/g, "ε"],
    [/Î¶/g, "ζ"],
    [/Î·/g, "η"],
    [/Î¸/g, "θ"],
    [/Î¹/g, "ι"],
    [/Îº/g, "κ"],
    [/Î»/g, "λ"],
    [/Î¼/g, "μ"],
    [/Î½/g, "ν"],
    [/Î¾/g, "ξ"],
    [/Ï€/g, "π"],
    [/Ï/g, "ρ"],
    [/Ïƒ/g, "σ"],
    [/Ï„/g, "τ"],
    [/Ï…/g, "υ"],
    [/Ï†/g, "φ"],
    [/Ï‡/g, "χ"],
    [/Ïˆ/g, "ψ"],
    [/Ï‰/g, "ω"],
    [/Î“/g, "Γ"],
    [/Î”/g, "Δ"],
    [/Î˜/g, "Θ"],
    [/Î›/g, "Λ"],
    [/Îž/g, "Ξ"],
    [/Î /g, "Π"],
    [/Î£/g, "Σ"],
    [/Î¦/g, "Φ"],
    [/Î¨/g, "Ψ"],
    [/Î©/g, "Ω"],
    // Powers & fractions
    [/Â²/g, "²"],
    [/Â³/g, "³"],
    [/Â¹/g, "¹"],
    [/Â½/g, "½"],
    [/Â¼/g, "¼"],
    [/Â¾/g, "¾"],
    // Punctuation & quotes
    [/â€“/g, "–"],
    [/â€”/g, "—"],
    [/â€˜/g, "‘"],
    [/â€™/g, "’"],
    [/â€œ/g, "“"],
    [/â€/g, "”"],
    [/â€¦/g, "…"],
  ];

  for (const [pattern, replacement] of mojibakeMap) {
    s = s.replace(pattern, replacement);
  }

  // HTML entity decoding for math characters
  const htmlEntities: [RegExp, string][] = [
    [/&radic;/gi, "√"],
    [/&infin;/gi, "∞"],
    [/&int;/gi, "∫"],
    [/&sum;/gi, "∑"],
    [/&prod;/gi, "∏"],
    [/&part;/gi, "∂"],
    [/&nabla;/gi, "∇"],
    [/&plusmn;/gi, "±"],
    [/&times;/gi, "×"],
    [/&divide;/gi, "÷"],
    [/&le;/gi, "≤"],
    [/&ge;/gi, "≥"],
    [/&ne;/gi, "≠"],
    [/&approx;/gi, "≈"],
    [/&equiv;/gi, "≡"],
    [/&isin;/gi, "∈"],
    [/&notin;/gi, "∉"],
    [/&sub;/gi, "⊂"],
    [/&sube;/gi, "⊆"],
    [/&cup;/gi, "∪"],
    [/&cap;/gi, "∩"],
    [/&forall;/gi, "∀"],
    [/&exist;/gi, "∃"],
    [/&there4;/gi, "∴"],
    [/&sim;/gi, "∼"],
    [/&cong;/gi, "≅"],
    [/&perp;/gi, "⊥"],
    [/&rarr;/gi, "→"],
    [/&larr;/gi, "←"],
    [/&rArr;/gi, "⇒"],
    [/&hArr;/gi, "⇔"],
    [/&deg;/gi, "°"],
    [/&alpha;/gi, "α"],
    [/&beta;/gi, "β"],
    [/&gamma;/gi, "γ"],
    [/&delta;/gi, "δ"],
    [/&epsilon;/gi, "ε"],
    [/&theta;/gi, "θ"],
    [/&lambda;/gi, "λ"],
    [/&mu;/gi, "μ"],
    [/&pi;/gi, "π"],
    [/&sigma;/gi, "σ"],
    [/&tau;/gi, "τ"],
    [/&phi;/gi, "φ"],
    [/&omega;/gi, "ω"],
    [/&Delta;/gi, "Δ"],
    [/&Omega;/gi, "Ω"],
    [/&sup2;/gi, "²"],
    [/&sup3;/gi, "³"],
    [/&sup1;/gi, "¹"],
    [/&frac12;/gi, "½"],
    [/&frac14;/gi, "¼"],
    [/&frac34;/gi, "¾"],
    [/&nbsp;/gi, " "],
    [/&amp;/gi, "&"],
    [/&lt;/gi, "<"],
    [/&gt;/gi, ">"],
  ];

  for (const [pattern, replacement] of htmlEntities) {
    s = s.replace(pattern, replacement);
  }

  // Strip unprintable control characters (except newline \n and tab \t)
  s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  return s;
}

// ==========================================
// 2. SUPERSCRIPT & SUBSCRIPT CONVERTER
// ==========================================
const SUPERSCRIPT_MAP: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
  "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽", ")": "⁾", "/": "ᐟ",
  "a": "ᵃ", "b": "ᵇ", "c": "ᶜ", "d": "ᵈ", "e": "ᵉ",
  "f": "ᶠ", "g": "ᵍ", "h": "ʰ", "i": "ⁱ", "j": "ʲ",
  "k": "ᵏ", "l": "ˡ", "m": "ᵐ", "n": "ⁿ", "o": "ᵒ",
  "p": "ᵖ", "r": "ʳ", "s": "ˢ", "t": "ᵗ", "u": "ᵘ",
  "v": "ᵛ", "w": "ʷ", "x": "ˣ", "y": "ʸ", "z": "ᶻ",
  "A": "ᴬ", "B": "ᴮ", "D": "ᴰ", "E": "ᴱ", "G": "ᴳ",
  "H": "ᴴ", "I": "ᴵ", "J": "ᴶ", "K": "ᴷ", "L": "ᴸ",
  "M": "ᴹ", "N": "ᴺ", "O": "ᴼ", "P": "ᴾ", "R": "ᴿ",
  "T": "ᵀ", "U": "ᵁ", "W": "ᵂ",
  "θ": "ᶿ", "φ": "ᵠ", "α": "ᵅ", "β": "ᵝ", "γ": "ᵞ",
};

const SUBSCRIPT_MAP: Record<string, string> = {
  "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
  "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
  "+": "₊", "-": "₋", "=": "₌", "(": "₍", ")": "₎",
  "a": "ₐ", "e": "ₑ", "h": "ₕ", "i": "ᵢ", "j": "ⱼ",
  "k": "ₖ", "l": "ₗ", "m": "ₘ", "n": "ₙ", "o": "ₒ",
  "p": "ₚ", "r": "ᵣ", "s": "ₛ", "t": "ₜ", "u": "ᵤ",
  "v": "ᵥ", "x": "ₓ",
};

export function toSuperscript(str: string): string {
  // First normalize \theta, \alpha etc. inside superscript
  const normalized = str
    .replace(/\\*(?:theta|θ)/gi, "θ")
    .replace(/\\*(?:phi|φ)/gi, "φ")
    .replace(/\\*(?:alpha|α)/gi, "α")
    .replace(/\\*(?:beta|β)/gi, "β")
    .replace(/\\*(?:gamma|γ)/gi, "γ")
    .replace(/\\/g, "");

  return normalized
    .split("")
    .map((char) => SUPERSCRIPT_MAP[char] || char)
    .join("");
}

export function toSubscript(str: string): string {
  const normalized = str
    .replace(/\\*(?:theta|θ)/gi, "θ")
    .replace(/\\*(?:phi|φ)/gi, "φ")
    .replace(/\\*(?:alpha|α)/gi, "α")
    .replace(/\\*(?:beta|β)/gi, "β")
    .replace(/\\*(?:gamma|γ)/gi, "γ")
    .replace(/\\/g, "");

  return normalized
    .split("")
    .map((char) => SUBSCRIPT_MAP[char] || char)
    .join("");
}

// ==========================================
// 3. BALANCED LATEX COMMAND RESOLUTION
// ==========================================
function replaceBalancedCommand(
  text: string,
  command: string,
  transform: (content: string) => string
): string {
  const prefix = `\\${command}`;
  let result = "";
  let remaining = text;

  while (true) {
    const idx = remaining.indexOf(prefix);
    if (idx === -1) {
      result += remaining;
      break;
    }

    result += remaining.slice(0, idx);
    let afterPrefix = remaining.slice(idx + prefix.length).trimStart();

    // Check for optional argument like \sqrt[3]{x}
    let optionalArg = "";
    if (afterPrefix.startsWith("[")) {
      const closeBracket = afterPrefix.indexOf("]");
      if (closeBracket !== -1) {
        optionalArg = afterPrefix.slice(1, closeBracket);
        afterPrefix = afterPrefix.slice(closeBracket + 1).trimStart();
      }
    }

    if (afterPrefix.startsWith("{")) {
      let depth = 0;
      let endIdx = -1;

      for (let i = 0; i < afterPrefix.length; i++) {
        if (afterPrefix[i] === "{") depth++;
        else if (afterPrefix[i] === "}") {
          depth--;
          if (depth === 0) {
            endIdx = i;
            break;
          }
        }
      }

      if (endIdx !== -1) {
        const inner = afterPrefix.slice(1, endIdx);
        if (optionalArg) {
          result += `${toSuperscript(optionalArg)}√(${cleanMathSymbols(inner)})`;
        } else {
          result += transform(inner);
        }
        remaining = afterPrefix.slice(endIdx + 1);
        continue;
      }
    }

    result += prefix;
    remaining = remaining.slice(idx + prefix.length);
  }

  return result;
}

// Convert \frac{num}{den} and \dfrac{num}{den} with balanced braces
function replaceFractions(text: string): string {
  const prefixes = ["\\frac", "\\dfrac"];
  let s = text;

  for (const prefix of prefixes) {
    let result = "";
    let remaining = s;

    while (true) {
      const idx = remaining.indexOf(prefix);
      if (idx === -1) {
        result += remaining;
        break;
      }

      result += remaining.slice(0, idx);
      let afterPrefix = remaining.slice(idx + prefix.length).trimStart();

      if (afterPrefix.startsWith("{")) {
        // Find numerator
        let depth = 0;
        let endIdx1 = -1;

        for (let i = 0; i < afterPrefix.length; i++) {
          if (afterPrefix[i] === "{") depth++;
          else if (afterPrefix[i] === "}") {
            depth--;
            if (depth === 0) {
              endIdx1 = i;
              break;
            }
          }
        }

        if (endIdx1 !== -1) {
          const num = afterPrefix.slice(1, endIdx1);
          let afterNum = afterPrefix.slice(endIdx1 + 1).trimStart();

          if (afterNum.startsWith("{")) {
            // Find denominator
            depth = 0;
            let endIdx2 = -1;

            for (let j = 0; j < afterNum.length; j++) {
              if (afterNum[j] === "{") depth++;
              else if (afterNum[j] === "}") {
                depth--;
                if (depth === 0) {
                  endIdx2 = j;
                  break;
                }
              }
            }

            if (endIdx2 !== -1) {
              const den = afterNum.slice(1, endIdx2);
              result += `(${cleanMathSymbols(num)} / ${cleanMathSymbols(den)})`;
              remaining = afterNum.slice(endIdx2 + 1);
              continue;
            }
          }
        }
      }

      result += prefix;
      remaining = remaining.slice(idx + prefix.length);
    }
    s = result;
  }

  return s;
}

// ==========================================
// 4. NATIVE WORD OMML MATRIX & EQUATION BUILDERS
// ==========================================

export function cleanMathSymbolsForMatrixCell(cell: string): string {
  if (!cell) return "";
  let s = repairMojibakeAndHtmlEntities(cell);
  s = replaceFractions(s);
  s = replaceBalancedCommand(s, "sqrt", (content) => `√(${cleanMathSymbolsForMatrixCell(content)})`);
  s = replaceBalancedCommand(s, "cbrt", (content) => `∛(${cleanMathSymbolsForMatrixCell(content)})`);
  s = replaceBalancedCommand(s, "vec", (content) => `${cleanMathSymbolsForMatrixCell(content)}⃗`);
  s = replaceBalancedCommand(s, "bar", (content) => `${cleanMathSymbolsForMatrixCell(content)}̄`);
  s = replaceBalancedCommand(s, "hat", (content) => `${cleanMathSymbolsForMatrixCell(content)}̂`);

  s = s
    .replace(/\\alpha(?![a-zA-Z])/g, "α")
    .replace(/\\beta(?![a-zA-Z])/g, "β")
    .replace(/\\gamma(?![a-zA-Z])/g, "γ")
    .replace(/\\delta(?![a-zA-Z])/g, "δ")
    .replace(/\\epsilon(?![a-zA-Z])|\\varepsilon(?![a-zA-Z])/g, "ε")
    .replace(/\\zeta(?![a-zA-Z])/g, "ζ")
    .replace(/\\eta(?![a-zA-Z])/g, "η")
    .replace(/\\theta(?![a-zA-Z])|\\vartheta(?![a-zA-Z])/g, "θ")
    .replace(/\\lambda(?![a-zA-Z])/g, "λ")
    .replace(/\\mu(?![a-zA-Z])/g, "μ")
    .replace(/\\pi(?![a-zA-Z])|\\varpi(?![a-zA-Z])/g, "π")
    .replace(/\\rho(?![a-zA-Z])|\\varrho(?![a-zA-Z])/g, "ρ")
    .replace(/\\sigma(?![a-zA-Z])|\\varsigma(?![a-zA-Z])/g, "σ")
    .replace(/\\tau(?![a-zA-Z])/g, "τ")
    .replace(/\\phi(?![a-zA-Z])|\\varphi(?![a-zA-Z])/g, "φ")
    .replace(/\\omega(?![a-zA-Z])/g, "ω")
    .replace(/\\Delta(?![a-zA-Z])/g, "Δ")
    .replace(/\\Lambda(?![a-zA-Z])/g, "Λ")
    .replace(/\\Sigma(?![a-zA-Z])/g, "Σ")
    .replace(/\\Omega(?![a-zA-Z])/g, "Ω");

  s = s.replace(/\^\{([^}]+)\}/g, (_, content) => toSuperscript(content));
  s = s.replace(/\^([0-9a-zA-Z+\-()])/g, (_, char) => toSuperscript(char));
  s = s.replace(/_\{([^}]+)\}/g, (_, content) => toSubscript(content));
  s = s.replace(/_([0-9a-zA-Z+\-()])/g, (_, char) => toSubscript(char));

  s = s
    .replace(/\\pm(?![a-zA-Z])/g, "±")
    .replace(/\\mp(?![a-zA-Z])/g, "∓")
    .replace(/\\times(?![a-zA-Z])/g, "×")
    .replace(/\\cdot(?![a-zA-Z])/g, "·")
    .replace(/\\neq(?![a-zA-Z])|\\ne(?![a-zA-Z])/g, "≠")
    .replace(/\\leq(?![a-zA-Z])|\\le(?![a-zA-Z])/g, "≤")
    .replace(/\\geq(?![a-zA-Z])|\\ge(?![a-zA-Z])/g, "≥");

  s = s.replace(/[{}]/g, "").replace(/\\([a-zA-Z]+)/g, "$1").replace(/\\/g, "");
  return s.trim();
}

/**
 * Builds authentic Word OpenXML (OMML) 2D matrix structure using BuilderElement:
 * <m:d> (delimiter with growing brackets)
 *   <m:dPr><m:begChr m:val="["/><m:endChr m:val="]"/><m:grow/></m:dPr>
 *   <m:e>
 *     <m:m> (matrix)
 *       <m:mPr><m:baseJc m:val="center"/><m:plcHide m:val="1"/></m:mPr>
 *       <m:mr><m:e><m:r><m:t>col1</m:t></m:r></m:e>...</m:mr> (rows)
 *     </m:m>
 *   </m:e>
 * </m:d>
 * Supports ANY dimensions: 2x2, 3x3, 4x4, 5x5, NxM.
 */
export function createOmmlMatrixElement(
  rows: string[][],
  bracketType: string = "["
): BuilderElement {
  let begChr = "[";
  let endChr = "]";

  const b = bracketType.trim().toLowerCase();
  if (b === "(" || b === "pmatrix") {
    begChr = "(";
    endChr = ")";
  } else if (b === "|" || b === "vmatrix") {
    begChr = "|";
    endChr = "|";
  } else if (b === "‖" || b === "vmatrix" || b === "||") {
    begChr = "‖";
    endChr = "‖";
  } else if (b === "{" || b === "bmatrix") {
    begChr = "{";
    endChr = "}";
  } else if (b === "none" || b === "matrix") {
    begChr = "";
    endChr = "";
  } else {
    begChr = "[";
    endChr = "]";
  }

  const rowElements = rows.map((row) => {
    const cellElements = row.map((cell) => {
      const cleanedCell = cleanMathSymbolsForMatrixCell(cell);
      return new BuilderElement({
        name: "m:e",
        children: [new MathRun(cleanedCell || " ")],
      });
    });

    return new BuilderElement({
      name: "m:mr",
      children:
        cellElements.length > 0
          ? cellElements
          : [new BuilderElement({ name: "m:e", children: [new MathRun(" ")] })],
    });
  });

  const matrixBody = new BuilderElement({
    name: "m:m",
    children: [
      new BuilderElement({
        name: "m:mPr",
        children: [
          new BuilderElement({
            name: "m:baseJc",
            attributes: { val: { key: "m:val", value: "center" } },
          }),
          new BuilderElement({
            name: "m:plcHide",
            attributes: { val: { key: "m:val", value: "1" } },
          }),
        ],
      }),
      ...rowElements,
    ],
  });

  if (!begChr && !endChr) {
    return matrixBody;
  }

  return new BuilderElement({
    name: "m:d",
    children: [
      new BuilderElement({
        name: "m:dPr",
        children: [
          new BuilderElement({
            name: "m:begChr",
            attributes: { val: { key: "m:val", value: begChr } },
          }),
          new BuilderElement({
            name: "m:endChr",
            attributes: { val: { key: "m:val", value: endChr } },
          }),
          new BuilderElement({ name: "m:grow" }),
        ],
      }),
      new BuilderElement({
        name: "m:e",
        children: [matrixBody],
      }),
    ],
  });
}

/**
 * Parses any mathematical formula string (from $...$ or $$...$$) into DocxMath children,
 * converting both LaTeX matrix syntax and linear matrix syntax into authentic 2D OMML matrix nodes.
 */
export function parseMathFormulaToChildren(
  formula: string
): (MathRun | BuilderElement)[] {
  const children: (MathRun | BuilderElement)[] = [];

  // Matches either LaTeX matrix: \begin{bmatrix} ... \end{bmatrix}
  // OR Linear format matrix: [matrix(...)] or [\matrix(...)] or (matrix(...)) or |matrix(...)|
  const matrixRegex =
    /(?:\\begin\{(matrix|bmatrix|pmatrix|vmatrix|Vmatrix|Bmatrix|array)\}(?:\{[lcr| ]+\})?([\s\S]*?)\\end\{\1\}|(\[|\(|\{|\||‖)?\\?matrix\(([\s\S]*?)\)(\]|\)|\}|\||‖)?)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = matrixRegex.exec(formula)) !== null) {
    const matchStart = match.index;
    const matchEnd = match.index + match[0].length;

    // Content before matrix
    if (matchStart > lastIndex) {
      const beforeText = formula.slice(lastIndex, matchStart);
      const cleanedBefore = cleanMathSymbols(beforeText, true);
      if (cleanedBefore) {
        children.push(new MathRun(cleanedBefore));
      }
    }

    let bracketType = "[";
    let matrixContent = "";

    if (match[1]) {
      // LaTeX matrix
      bracketType = match[1];
      matrixContent = match[2];
    } else {
      // Linear matrix
      bracketType = match[3] || match[5] || "[";
      matrixContent = match[4];
    }

    // Split rows: split by @, \\, \cr, or newline
    const rawRows = matrixContent
      .split(/(?:@|\\\\|\\cr|\r?\n)/)
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    const parsedRows = rawRows.map((row) =>
      row.split("&").map((col) => col.trim())
    );

    if (parsedRows.length > 0) {
      const matrixElement = createOmmlMatrixElement(parsedRows, bracketType);
      children.push(matrixElement);
    }

    lastIndex = matchEnd;
  }

  // Content after last matrix
  if (lastIndex < formula.length) {
    const afterText = formula.slice(lastIndex);
    const cleanedAfter = cleanMathSymbols(afterText, true);
    if (cleanedAfter) {
      children.push(new MathRun(cleanedAfter));
    }
  }

  // If no matrix was found, standard MathRun
  if (children.length === 0 && formula.trim()) {
    const cleaned = cleanMathSymbols(formula, true);
    if (cleaned) {
      children.push(new MathRun(cleaned));
    }
  }

  return children;
}

/**
 * Backward compatibility fallback
 */
export function convertLatexMatrixToWordMatrix(raw: string): string {
  return raw;
}

/**
 * Un-fuses OCR and PDF extracted words that got jammed against math expressions
 * (e.g. "IfA" -> "If A", "ofA^3" -> "of A^3", "functionf(z)" -> "function f(z)")
 */
export function unfuseWordBoundaries(text: string): string {
  if (!text) return "";
  let s = text;

  // 1. Unfuse words fused with dollar signs: e.g. "If$A$" -> "If $A$", "$A$find" -> "$A$ find"
  s = s.replace(/([a-zA-Z0-9_])\$(?!\$)/g, "$1 $");
  s = s.replace(/\$(?!\$)([a-zA-Z0-9_])/g, "$ $1");

  // 2. Unfuse common English words fused with math variables or matrices
  s = s.replace(
    /\b(If|of|matrix|variable|that|from|to|along|into|with|by|where|function)\s*([A-Za-z])/g,
    "$1 $2"
  );
  s = s.replace(/\bxyfrom([A-Za-z])/gi, "xy from $1");
  s = s.replace(/\b([A-Za-z]+)follows\b/gi, "$1 follows");
  s = s.replace(/\bofcos\b/gi, "of cos");
  s = s.replace(/\boff\b(?=\()/gi, "of f");
  s = s.replace(/(\]|[\)])([a-zA-Z]{2,})/g, "$1 $2"); // e.g. "]find" -> "] find"

  // 3. Ensure standalone matrices not wrapped in $ get wrapped so they are parsed into OMML
  s = s.replace(
    /((?:\[|\(|\{|\||‖)?\\?matrix\([\s\S]*?\)(?:\]|\)|\}|\||‖)?)/g,
    (m) => ` $${m.trim()}$ `
  );
  s = s.replace(
    /(\\begin\{(?:matrix|bmatrix|pmatrix|vmatrix|Vmatrix|Bmatrix|array)\}(?:\{[lcr| ]+\})?[\s\S]*?\\end\{(?:matrix|bmatrix|pmatrix|vmatrix|Vmatrix|Bmatrix|array)\})/g,
    (m) => ` $${m.trim()}$ `
  );

  return s;
}

/**
 * Standardizes chemical formulas and reaction equations:
 * - Reaction arrows: -> to →, <=> to ⇌
 * - Precipitate and gas evolution: v to ↓, ^ to ↑
 * - Subscripts for stoichiometry: H2O to H₂O, CaCO3 to CaCO₃
 * - Superscripts for ionic charges: Fe^3+ to Fe³⁺, SO4^2- to SO₄²⁻
 */
export function cleanChemistryFormula(raw: string): string {
  if (!raw) return "";
  let s = raw;
  // 1. Superscript charges: e.g. ^2+, ^+, ^3-, ^{2+}, ^-, e^-
  s = s.replace(/\^\{?([0-9]*[\+\-])\}?/g, (_, charge) => toSuperscript(charge));
  s = s.replace(/e\^\{?-\}?/g, "e⁻");
  // 2. Reversible / equilibrium arrows
  s = s.replace(/<=+>|<->|\\rightleftharpoons/g, "⇌");
  // 3. Standard reaction arrows
  s = s.replace(/-+>|\\rightarrow/g, "→");
  // 4. Standalone gas / precipitate markers
  s = s.replace(/\s\^(\s|$)/g, " ↑$1");
  s = s.replace(/\sv(\s|$)/g, " ↓$1");
  // 5. Chemical stoichiometry subscripts following element letters or brackets
  const subMap: Record<string, string> = {
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
    "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉"
  };
  s = s.replace(/([A-Za-z\)])([0-9]+)/g, (_, prefix, nums) => {
    return prefix + nums.split("").map((n: string) => subMap[n] || n).join("");
  });
  return s;
}

// ==========================================
// 5. CLEAN & STANDARDIZE MATH SYMBOLS
// ==========================================
export function cleanMathSymbols(raw: string, preserveWhitespace: boolean = false): string {
  if (!raw) return "";

  // Step 1: Repair any mojibake & HTML entities
  let s = repairMojibakeAndHtmlEntities(raw);

  // Normalize multiple backslashes (e.g. \\sqrt -> \sqrt)
  s = s.replace(/\\{2,}/g, "\\");

  // Step 2: Handle fractions and roots
  s = replaceFractions(s);
  s = replaceBalancedCommand(s, "sqrt", (content) => `√(${cleanMathSymbols(content, false)})`);
  s = replaceBalancedCommand(s, "cbrt", (content) => `∛(${cleanMathSymbols(content, false)})`);

  // Step 3: Handle vectors and accents
  s = replaceBalancedCommand(s, "vec", (content) => `${cleanMathSymbols(content, false)}⃗`);
  s = replaceBalancedCommand(s, "bar", (content) => `${cleanMathSymbols(content, false)}̄`);
  s = replaceBalancedCommand(s, "hat", (content) => `${cleanMathSymbols(content, false)}̂`);
  s = replaceBalancedCommand(s, "dot", (content) => `${cleanMathSymbols(content, false)}̇`);
  s = replaceBalancedCommand(s, "ddot", (content) => `${cleanMathSymbols(content, false)}̈`);

  // Step 3.5: Chemistry \ce{...} (mhchem) equations
  s = replaceBalancedCommand(s, "ce", (content) => cleanChemistryFormula(content));

  // Step 4: Greek letters (lowercase)
  s = s
    .replace(/\\alpha(?![a-zA-Z])/g, "α")
    .replace(/\\beta(?![a-zA-Z])/g, "β")
    .replace(/\\gamma(?![a-zA-Z])/g, "γ")
    .replace(/\\delta(?![a-zA-Z])/g, "δ")
    .replace(/\\epsilon(?![a-zA-Z])|\\varepsilon(?![a-zA-Z])/g, "ε")
    .replace(/\\zeta(?![a-zA-Z])/g, "ζ")
    .replace(/\\eta(?![a-zA-Z])/g, "η")
    .replace(/\\theta(?![a-zA-Z])|\\vartheta(?![a-zA-Z])/g, "θ")
    .replace(/\\iota(?![a-zA-Z])/g, "ι")
    .replace(/\\kappa(?![a-zA-Z])/g, "κ")
    .replace(/\\lambda(?![a-zA-Z])/g, "λ")
    .replace(/\\mu(?![a-zA-Z])/g, "μ")
    .replace(/\\nu(?![a-zA-Z])/g, "ν")
    .replace(/\\xi(?![a-zA-Z])/g, "ξ")
    .replace(/\\pi(?![a-zA-Z])|\\varpi(?![a-zA-Z])/g, "π")
    .replace(/\\rho(?![a-zA-Z])|\\varrho(?![a-zA-Z])/g, "ρ")
    .replace(/\\sigma(?![a-zA-Z])|\\varsigma(?![a-zA-Z])/g, "σ")
    .replace(/\\tau(?![a-zA-Z])/g, "τ")
    .replace(/\\upsilon(?![a-zA-Z])/g, "υ")
    .replace(/\\phi(?![a-zA-Z])|\\varphi(?![a-zA-Z])/g, "φ")
    .replace(/\\chi(?![a-zA-Z])/g, "χ")
    .replace(/\\psi(?![a-zA-Z])/g, "ψ")
    .replace(/\\omega(?![a-zA-Z])/g, "ω");

  // Step 5: Greek letters (uppercase)
  s = s
    .replace(/\\Gamma(?![a-zA-Z])/g, "Γ")
    .replace(/\\Delta(?![a-zA-Z])/g, "Δ")
    .replace(/\\Theta(?![a-zA-Z])/g, "Θ")
    .replace(/\\Lambda(?![a-zA-Z])/g, "Λ")
    .replace(/\\Xi(?![a-zA-Z])/g, "Ξ")
    .replace(/\\Pi(?![a-zA-Z])/g, "Π")
    .replace(/\\Sigma(?![a-zA-Z])/g, "Σ")
    .replace(/\\Upsilon(?![a-zA-Z])/g, "Υ")
    .replace(/\\Phi(?![a-zA-Z])/g, "Φ")
    .replace(/\\Psi(?![a-zA-Z])/g, "Ψ")
    .replace(/\\Omega(?![a-zA-Z])/g, "Ω");

  // Step 6: Mathematical operators & calculus
  s = s
    .replace(/\\int(?![a-zA-Z])/g, "∫")
    .replace(/\\iint(?![a-zA-Z])/g, "∬")
    .replace(/\\iiint(?![a-zA-Z])/g, "∭")
    .replace(/\\oint(?![a-zA-Z])/g, "∮")
    .replace(/\\sum(?![a-zA-Z])/g, "∑")
    .replace(/\\prod(?![a-zA-Z])/g, "∏")
    .replace(/\\infty(?![a-zA-Z])/g, "∞")
    .replace(/\\partial(?![a-zA-Z])/g, "∂")
    .replace(/\\nabla(?![a-zA-Z])/g, "∇")
    .replace(/\\pm(?![a-zA-Z])/g, "±")
    .replace(/\\mp(?![a-zA-Z])/g, "∓")
    .replace(/\\times(?![a-zA-Z])/g, "×")
    .replace(/\\cdot(?![a-zA-Z])/g, "·")
    .replace(/\\div(?![a-zA-Z])/g, "÷")
    .replace(/\\neq(?![a-zA-Z])|\\ne(?![a-zA-Z])/g, "≠")
    .replace(/\\leq(?![a-zA-Z])|\\le(?![a-zA-Z])/g, "≤")
    .replace(/\\geq(?![a-zA-Z])|\\ge(?![a-zA-Z])/g, "≥")
    .replace(/\\approx(?![a-zA-Z])/g, "≈")
    .replace(/\\equiv(?![a-zA-Z])/g, "≡")
    .replace(/\\sim(?![a-zA-Z])/g, "∼")
    .replace(/\\cong(?![a-zA-Z])/g, "≅")
    .replace(/\\propto(?![a-zA-Z])/g, "∝")
    .replace(/\\in(?![a-zA-Z])/g, "∈")
    .replace(/\\notin(?![a-zA-Z])/g, "∉")
    .replace(/\\subset(?![a-zA-Z])/g, "⊂")
    .replace(/\\subseteq(?![a-zA-Z])/g, "⊆")
    .replace(/\\supset(?![a-zA-Z])/g, "⊃")
    .replace(/\\supseteq(?![a-zA-Z])/g, "⊇")
    .replace(/\\cup(?![a-zA-Z])/g, "∪")
    .replace(/\\cap(?![a-zA-Z])/g, "∩")
    .replace(/\\forall(?![a-zA-Z])/g, "∀")
    .replace(/\\exists(?![a-zA-Z])/g, "∃")
    .replace(/\\rightarrow(?![a-zA-Z])|\\to(?![a-zA-Z])/g, "→")
    .replace(/\\leftarrow(?![a-zA-Z])/g, "←")
    .replace(/\\Rightarrow(?![a-zA-Z])|\\implies(?![a-zA-Z])/g, "⇒")
    .replace(/\\Leftarrow(?![a-zA-Z])/g, "⇐")
    .replace(/\\Leftrightarrow(?![a-zA-Z])|\\iff(?![a-zA-Z])/g, "⇔")
    .replace(/\\rightleftharpoons(?![a-zA-Z])/g, "⇌")
    .replace(/\\leftrightarrow(?![a-zA-Z])/g, "↔")
    .replace(/\\uparrow(?![a-zA-Z])/g, "↑")
    .replace(/\\downarrow(?![a-zA-Z])/g, "↓")
    .replace(/\\hbar(?![a-zA-Z])/g, "ħ")
    .replace(/\\ell(?![a-zA-Z])/g, "ℓ")
    .replace(/\\AA(?![a-zA-Z])|\\angstrom(?![a-zA-Z])/g, "Å")
    .replace(/\\xrightarrow\[(.*?)\]\{(.*?)\}/g, "⎯⎯[$1 / $2]⎯→")
    .replace(/\\xrightarrow\{(.*?)\}/g, "⎯⎯[$1]⎯→")
    .replace(/\\therefore(?![a-zA-Z])/g, "∴")
    .replace(/\\because(?![a-zA-Z])/g, "∵")
    .replace(/\\perp(?![a-zA-Z])/g, "⊥")
    .replace(/\\parallel(?![a-zA-Z])/g, "∥")
    .replace(/\\angle(?![a-zA-Z])/g, "∠")
    .replace(/\\degree(?![a-zA-Z])|\^\\circ(?![a-zA-Z])|\^\{?\\circ\}?/g, "°");

  // Step 7: Trigonometric, hyperbolic, log, limit functions
  s = s
    .replace(/\\sin\^\{-1\}/g, "sin⁻¹")
    .replace(/\\cos\^\{-1\}/g, "cos⁻¹")
    .replace(/\\tan\^\{-1\}/g, "tan⁻¹")
    .replace(/\\csc\^\{-1\}/g, "csc⁻¹")
    .replace(/\\sec\^\{-1\}/g, "sec⁻¹")
    .replace(/\\cot\^\{-1\}/g, "cot⁻¹")
    .replace(/\\arcsin(?![a-zA-Z])/g, "sin⁻¹")
    .replace(/\\arccos(?![a-zA-Z])/g, "cos⁻¹")
    .replace(/\\arctan(?![a-zA-Z])/g, "tan⁻¹")
    .replace(/\\sin(?![a-zA-Z])/g, "sin")
    .replace(/\\cos(?![a-zA-Z])/g, "cos")
    .replace(/\\tan(?![a-zA-Z])/g, "tan")
    .replace(/\\csc(?![a-zA-Z])/g, "csc")
    .replace(/\\sec(?![a-zA-Z])/g, "sec")
    .replace(/\\cot(?![a-zA-Z])/g, "cot")
    .replace(/\\sinh(?![a-zA-Z])/g, "sinh")
    .replace(/\\cosh(?![a-zA-Z])/g, "cosh")
    .replace(/\\tanh(?![a-zA-Z])/g, "tanh")
    .replace(/\\log(?![a-zA-Z])/g, "log")
    .replace(/\\ln(?![a-zA-Z])/g, "ln")
    .replace(/\\lim(?![a-zA-Z])/g, "lim")
    .replace(/\\det(?![a-zA-Z])/g, "det")
    .replace(/\\max(?![a-zA-Z])/g, "max")
    .replace(/\\min(?![a-zA-Z])/g, "min");

  // Step 8: Standard Superscripts with braces: ^{...} or single char: ^x
  s = s.replace(/\^\{([^}]+)\}/g, (_, content) => toSuperscript(content));
  s = s.replace(/\^([0-9a-zA-Z+\-()])/g, (_, char) => toSuperscript(char));

  // Step 9: Standard Subscripts with braces: _{...} or single char: _x
  s = s.replace(/_\{([^}]+)\}/g, (_, content) => toSubscript(content));
  s = s.replace(/_([0-9a-zA-Z+\-()])/g, (_, char) => toSubscript(char));

  // Step 10: Clean LaTeX wrapper commands, spacing, and residual backslashes
  s = s
    .replace(/\\left\s*([(\[{|])/g, "$1")
    .replace(/\\right\s*([)\]}|])/g, "$1")
    .replace(/\\mathbf\{([^}]+)\}/g, "$1")
    .replace(/\\mathrm\{([^}]+)\}/g, "$1")
    .replace(/\\text\{([^}]+)\}/g, "$1")
    .replace(/\\,/g, " ")
    .replace(/\\;/g, " ")
    .replace(/\\!/g, "")
    .replace(/\\quad\b/g, "   ")
    .replace(/\\qquad\b/g, "      ")
    .replace(/[{}]/g, "") // Clean any leftover grouping braces
    .replace(/\\([a-zA-Z]+)/g, "$1") // Clean any unrecognized LaTeX commands
    .replace(/\\/g, ""); // Clean any stray backslashes

  s = s.replace(/[ \t]{2,}/g, " ");
  return preserveWhitespace ? s : s.trim();
}

// ==========================================
// 5. WORD PARAGRAPH BUILDER
// ==========================================
export function buildMathParagraph(
  line: string,
  headingLevel?: (typeof HeadingLevel)[keyof typeof HeadingLevel]
): Paragraph {
  // First clean encoding and mojibake from the entire line
  let cleanedLine = repairMojibakeAndHtmlEntities(line);

  // Un-fuse word boundaries and wrap standalone matrices in $...$
  cleanedLine = unfuseWordBoundaries(cleanedLine);

  // Check if line represents a Question Number in a Question Bank (e.g. "Q1.", "Q.1", "Question 1:", "1.")
  const questionHeaderMatch = cleanedLine.match(/^(\*{0,2}(?:Q(?:uestion|\.)?\s*\d+[\w.]*|Problem\s*\d+[\w.]*|\d+\.)\*{0,2})(.*)/i);
  const isQuestionHeader = !headingLevel && !!questionHeaderMatch;

  // Split by LaTeX math markers: $$...$$, $...$, \[...\], \(...\)
  const segments = cleanedLine.split(/(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\))/g);
  const children: (TextRun | DocxMath)[] = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (!seg) continue;

    const isExplicitMath =
      (seg.startsWith("$$") && seg.endsWith("$$")) ||
      (seg.startsWith("$") && seg.endsWith("$")) ||
      (seg.startsWith("\\[") && seg.endsWith("\\]")) ||
      (seg.startsWith("\\(") && seg.endsWith("\\)"));

    if (isExplicitMath) {
      // Strip outer delimiter markers
      const rawFormula = seg
        .replace(/^(\$\$|\$|\\\[|\\\()/, "")
        .replace(/(\$\$|\$|\\\]|\\\))$/, "")
        .trim();

      const mathChildren = parseMathFormulaToChildren(rawFormula);

      if (mathChildren.length > 0) {
        children.push(
          new DocxMath({
            children: mathChildren,
          })
        );
      }
    } else {
      // Segment is regular text.
      // Ensure proper boundary spacing adjacent to math:
      let text = seg;

      // If preceded by a math block and doesn't start with space or punctuation:
      if (i > 0 && segments[i - 1]?.startsWith("$") && !/^[\s.,\)\]\}:;?!]/.test(text)) {
        text = " " + text;
      }
      // If followed by a math block and doesn't end with space or opening bracket:
      if (i < segments.length - 1 && segments[i + 1]?.startsWith("$") && !/[\s\(\[\{]$/.test(text)) {
        text = text + " ";
      }

      const hasMathSymbols = /[√∛∫∬∭∮∑∏∞∂∇±∓×÷≠≤≥≈≡∼≅∝∈∉⊂⊆∪∩∀∃→←⇒⇔∴∵⊥∥∠°αβγδεζηθικλμνξπρστυφχψωΓΔΘΛΞΠΣΥΦΨΩ⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿⁱᶿ₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎ᵢⱼ]/.test(
        text
      );

      const cleaned = cleanMathSymbols(text, true);

      if (hasMathSymbols) {
        // Render math symbols using Cambria Math font for flawless native rendering in Word
        children.push(
          new TextRun({
            text: cleaned,
            font: "Cambria Math",
            size: headingLevel ? 28 : isQuestionHeader ? 24 : 22,
            bold: !!headingLevel || isQuestionHeader,
            color: headingLevel ? "111827" : "1F2937",
          })
        );
      } else {
        // Standard text
        children.push(
          new TextRun({
            text: cleaned,
            font: "Calibri",
            size: headingLevel ? 28 : isQuestionHeader ? 24 : 22,
            bold: !!headingLevel || (isQuestionHeader && seg === questionHeaderMatch?.[1]),
            color: headingLevel ? "111827" : isQuestionHeader ? "007038" : "1F2937",
          })
        );
      }
    }
  }

  // Question option formatting: e.g. (A) ... (B) ... (C) ... (D) ...
  const isOptionLine = /^\s*\([A-Da-d1-4]\)\s+/.test(cleanedLine);

  return new Paragraph({
    children,
    heading: headingLevel,
    spacing: headingLevel
      ? { before: 240, after: 120 }
      : isQuestionHeader
      ? { before: 200, after: 80 }
      : isOptionLine
      ? { before: 40, after: 80 }
      : { after: 140, line: 280 },
    indent: isOptionLine ? { left: 720 } : undefined, // Half-inch indent for options
  });
}

// ==========================================
// 6. NATIVE WORD TABLE BUILDER
// ==========================================
export function buildWordTable(lines: string[]): Table {
  // Filter and trim table lines
  const cleanLines = lines.map((l) => l.trim()).filter((l) => l.startsWith("|") && l.includes("|"));
  if (cleanLines.length === 0) {
    return new Table({ rows: [] });
  }

  const parsedRows: string[][] = [];
  let hasSeparator = false;

  for (const line of cleanLines) {
    // Check if line is a delimiter like |---|---| or |:---|---:|
    if (/^\|(?:\s*:?-+:?\s*\|)+$/.test(line)) {
      hasSeparator = true;
      continue;
    }

    // Split cells by pipe '|'
    const rawCells = line.split("|");
    // Strip leading and trailing empty items from outer pipes
    const cells = rawCells.slice(1, line.endsWith("|") ? -1 : undefined).map((c) => c.trim());
    if (cells.length > 0) {
      parsedRows.push(cells);
    }
  }

  if (parsedRows.length === 0) {
    return new Table({ rows: [] });
  }

  const maxCols = Math.max(...parsedRows.map((r) => r.length));
  const colWidthPct = Math.floor(100 / Math.max(maxCols, 1));

  const tableRows: TableRow[] = [];

  for (let rIdx = 0; rIdx < parsedRows.length; rIdx++) {
    const isHeader = rIdx === 0 && hasSeparator;
    const cells = parsedRows[rIdx];
    const tableCells: TableCell[] = [];

    for (let cIdx = 0; cIdx < maxCols; cIdx++) {
      const cellText = cells[cIdx] || "";
      const cellParagraph = buildMathParagraph(cellText);

      tableCells.push(
        new TableCell({
          children: [cellParagraph],
          width: { size: colWidthPct, type: WidthType.PERCENTAGE },
          shading: isHeader
            ? { fill: "F3F4F6", type: ShadingType.CLEAR } // Clean academic header tint
            : undefined,
          margins: {
            top: 140, // ~7pt padding
            bottom: 140,
            left: 180, // ~9pt padding
            right: 180,
          },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
            bottom: { style: BorderStyle.SINGLE, size: isHeader ? 2 : 1, color: isHeader ? "9CA3AF" : "D1D5DB" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" },
          },
        })
      );
    }

    tableRows.push(
      new TableRow({
        children: tableCells,
        tableHeader: isHeader,
      })
    );
  }

  return new Table({
    rows: tableRows,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    alignment: AlignmentType.CENTER,
  });
}

// ==========================================
// 7. UNIFIED DOCUMENT ELEMENTS PARSER
// ==========================================
// Transforms reconstructed document markdown into native Word Paragraphs and Tables
// while preserving multiline matrices, display equations, questions, and headers.
export function buildDocumentElements(text: string, title?: string): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  if (title && title.trim()) {
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: title.trim(),
            bold: true,
            size: 36, // 18pt
            color: "00C269", // CodeBits Emerald
            font: "Calibri",
          }),
        ],
        spacing: { after: 280 },
      })
    );
  }

  if (!text || !text.trim()) return elements;

  // Step 1: Pre-process multiline $$ ... $$ blocks so matrices are not broken across paragraphs
  let normalized = text.replace(/\$\$([\s\S]*?)\$\$/g, (_m, inner) => {
    const flattened = inner.replace(/\r?\n\s*/g, " ").trim();
    return `$$${flattened}$$`;
  });

  // Step 2: Pre-process \begin{...matrix} ... \end{...matrix} blocks that might not be in $$
  normalized = normalized.replace(
    /\\begin\{(matrix|bmatrix|pmatrix|vmatrix|Vmatrix|Bmatrix|array)\}(?:\{[lcr| ]+\})?([\s\S]*?)\\end\{\1\}/g,
    (_m, type, inner) => {
      const flattened = inner.replace(/\r?\n\s*/g, " ").trim();
      return `\\begin{${type}} ${flattened} \\end{${type}}`;
    }
  );

  // Step 3: Pre-process [matrix(...)] blocks that might span multiple lines
  normalized = normalized.replace(
    /((?:\[|\(|\{|\||‖)?\\?matrix\([\s\S]*?\)(?:\]|\)|\}|\||‖)?)/g,
    (m) => m.replace(/\r?\n\s*/g, " ")
  );

  const lines = normalized.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check if line is the start of a Markdown table: starts with | and contains |
    if (line.startsWith("|") && line.includes("|")) {
      const tableLines: string[] = [line];
      let j = i + 1;
      while (j < lines.length) {
        const nextLine = lines[j].trim();
        if (nextLine.startsWith("|") && nextLine.includes("|")) {
          tableLines.push(nextLine);
          j++;
        } else {
          break;
        }
      }

      // If we found at least 2 table lines (e.g. header + separator or data row)
      if (tableLines.length >= 2) {
        elements.push(buildWordTable(tableLines));
        // Add subtle spacing after table
        elements.push(new Paragraph({ children: [], spacing: { after: 140 } }));
        i = j - 1; // Advance loop past the table!
        continue;
      }
    }

    // Heading 1: # Title
    if (line.startsWith("# ")) {
      elements.push(buildMathParagraph(line.replace(/^#\s+/, ""), HeadingLevel.HEADING_1));
    }
    // Heading 2: ## Subtitle / Section
    else if (line.startsWith("## ")) {
      elements.push(buildMathParagraph(line.replace(/^##\s+/, ""), HeadingLevel.HEADING_2));
    }
    // Heading 3: ### Subheading / Question Header
    else if (line.startsWith("### ")) {
      elements.push(buildMathParagraph(line.replace(/^###\s+/, ""), HeadingLevel.HEADING_3));
    }
    // Bullet List item
    else if (/^[-*•]\s+/.test(line)) {
      elements.push(buildMathParagraph(line.replace(/^[-*•]\s+/, "")));
    }
    // Standard Paragraph or Equation / Matrix Line
    else {
      elements.push(buildMathParagraph(line));
    }
  }

  return elements;
}
