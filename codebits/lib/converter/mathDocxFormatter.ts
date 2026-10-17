import {
  Paragraph,
  TextRun,
  HeadingLevel,
  Math as DocxMath,
  MathRun,
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
// 4. CLEAN & STANDARDIZE MATH SYMBOLS
// ==========================================
export function cleanMathSymbols(raw: string): string {
  if (!raw) return "";

  // Step 1: Repair any mojibake & HTML entities
  let s = repairMojibakeAndHtmlEntities(raw);

  // Normalize multiple backslashes (e.g. \\sqrt -> \sqrt)
  s = s.replace(/\\{2,}/g, "\\");

  // Step 2: Handle fractions and roots
  s = replaceFractions(s);
  s = replaceBalancedCommand(s, "sqrt", (content) => `√(${cleanMathSymbols(content)})`);
  s = replaceBalancedCommand(s, "cbrt", (content) => `∛(${cleanMathSymbols(content)})`);

  // Step 3: Handle vectors and accents
  s = replaceBalancedCommand(s, "vec", (content) => `${cleanMathSymbols(content)}⃗`);
  s = replaceBalancedCommand(s, "bar", (content) => `${cleanMathSymbols(content)}̄`);
  s = replaceBalancedCommand(s, "hat", (content) => `${cleanMathSymbols(content)}̂`);
  s = replaceBalancedCommand(s, "dot", (content) => `${cleanMathSymbols(content)}̇`);
  s = replaceBalancedCommand(s, "ddot", (content) => `${cleanMathSymbols(content)}̈`);

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
  // Matches e.g. ^{-1/2}, ^{1/2}, ^{i\theta}, ^{2}, ^{n+1}, ^2, ^k
  s = s.replace(/\^\{([^}]+)\}/g, (_, content) => toSuperscript(content));
  s = s.replace(/\^([0-9a-zA-Z+\-()])/g, (_, char) => toSuperscript(char));

  // Step 9: Standard Subscripts with braces: _{...} or single char: _x
  // Matches e.g. _{0}, _{n}, _{ij}, _1, _x
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

  return s.replace(/\s{2,}/g, " ").trim();
}

// ==========================================
// 5. WORD PARAGRAPH BUILDER
// ==========================================
export function buildMathParagraph(
  line: string,
  headingLevel?: (typeof HeadingLevel)[keyof typeof HeadingLevel]
): Paragraph {
  // First clean encoding and mojibake from the entire line
  const cleanedLine = repairMojibakeAndHtmlEntities(line);

  // Check if line represents a Question Number in a Question Bank (e.g. "Q1.", "Q.1", "Question 1:", "1.")
  const questionHeaderMatch = cleanedLine.match(/^(\*{0,2}(?:Q(?:uestion|\.)?\s*\d+[\w.]*|Problem\s*\d+[\w.]*|\d+\.)\*{0,2})(.*)/i);
  const isQuestionHeader = !headingLevel && !!questionHeaderMatch;

  // Split by LaTeX math markers: $$...$$, $...$, \[...\], \(...\)
  const segments = cleanedLine.split(/(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\))/g);
  const children: (TextRun | DocxMath)[] = [];

  for (const seg of segments) {
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

      const cleanedFormula = cleanMathSymbols(rawFormula);

      // Add as native Word Office Math (m:oMath) element!
      children.push(
        new DocxMath({
          children: [new MathRun(cleanedFormula)],
        })
      );
    } else {
      // Segment is regular text or inline math without $ delimiters.
      // Check if it contains mathematical symbols or equations (e.g. θ, √, ∫, ∑, π, ±, ≤, ≥, =, ^, _)
      const hasMathSymbols = /[√∛∫∬∭∮∑∏∞∂∇±∓×÷≠≤≥≈≡∼≅∝∈∉⊂⊆∪∩∀∃→←⇒⇔∴∵⊥∥∠°αβγδεζηθικλμνξπρστυφχψωΓΔΘΛΞΠΣΥΦΨΩ⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿⁱᶿ₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎ᵢⱼ]/.test(
        seg
      );

      // Also clean any un-delimited LaTeX commands like \theta, \sqrt, \frac
      const cleaned = cleanMathSymbols(seg);

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
