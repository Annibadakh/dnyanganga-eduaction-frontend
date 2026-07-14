import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

/**
 * ── What this file assumes about its input ──────────────────────────────
 *
 * MathEditor.jsx wasn't available to double check against directly, so the
 * contract below is reverse-engineered from the *previous* version of this
 * file (which already encoded a lot of it) plus how it's consumed in
 * QuestionManager.jsx (questionText / option.text / solutionDescription are
 * all plain strings run through renderMathText for preview). If the editor's
 * actual output ever drifts from this, the safe fallback below (plain text,
 * or a visible-but-contained KaTeX error) means a mismatch degrades gracefully
 * instead of crashing the question list.
 *
 * A field's value is either:
 *   - Plain prose with no `$...$` wrapper at all → rendered as-is.
 *   - A single value wrapped once in `$...$`, whose *inside* mixes:
 *       - `\text{...}` for prose
 *       - raw LaTeX for actual math
 *       - `\\` to separate multiple lines, optionally wrapped in
 *         `\displaylines{...}` or `\begin{array}{l}...\end{array}`
 *           (both are pure line-wrapping containers with no math meaning
 *            of their own)
 *       - real environments (`pmatrix`, `cases`, `aligned`, a genuine
 *         multi-column `array`, ...), which must be left completely intact
 *         for KaTeX, even when they sit inside a `\displaylines`/`array{l}`
 *         wrapper alongside plain text lines, and even when they contain
 *         their own nested `\text{...}` labels (e.g. a piecewise function's
 *         "if x ≥ 0" labels).
 *
 * ── What changed vs. the previous version ───────────────────────────────
 *   1. Row-splitting is now brace/environment-depth aware. Previously, any
 *      `\\` in the string was treated as a line break — including the `\\`
 *      *inside* a matrix's own rows. A matrix embedded inside a
 *      `\displaylines{}` (alongside a text line) would get its rows torn
 *      apart. Now only a `\\` outside any `{...}` group *and* outside any
 *      `\begin{...}...\end{...}` counts as a line break.
 *   2. `\text{...}` extraction is now depth-aware too. Previously *any*
 *      `\text{...}` anywhere was pulled out as a separate segment — which
 *      silently corrupted `\begin{cases}...\end{cases}` blocks that use
 *      `\text{if }` as an inline label, and similarly for `\text{}` nested
 *      inside a `\frac{}{}` argument. Now `\text{...}` is only treated as a
 *      prose/math boundary at the outermost level of a line; nested inside
 *      any group or environment, it's left untouched for KaTeX to render
 *      natively (which it supports everywhere in math mode).
 *   3. Escaped braces `\{` `\}` (e.g. set notation `\{1, 2, 3\}`) are now
 *      correctly treated as literal, non-grouping characters everywhere
 *      brace depth is tracked, instead of accidentally being counted as
 *      real grouping delimiters.
 *   4. `\\[10pt]`-style optional spacing after a line break is consumed
 *      instead of leaking into the next line's text.
 *   5. Malformed/unbalanced LaTeX (unterminated `\text{`, stray `\begin`
 *      without `\end`, unknown commands, ...) no longer bubbles up a bare
 *      KaTeX error box — `renderError` now renders the raw source in a
 *      small monospace tag instead, so one bad question/option doesn't
 *      visually break the rest of the list. The underlying KaTeX error is
 *      still logged to the console and available as a tooltip for whoever
 *      is authoring the content.
 */

// ─── Text unescaping (content inside \text{...}) ───────────────────────────
const unescapeLatexText = (str) =>
  str
    .replace(/\\\\/g, "\n")
    .replace(/\\([%$&#_{}])/g, "$1")
    .replace(/\\textbackslash\{?\}?/g, "\\")
    .replace(/~/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();

// ─── Brace matching, aware of escaped \{ \} (literal, non-grouping) ───────
const findMatchingBrace = (str, openIdx) => {
  let depth = 0;
  for (let i = openIdx; i < str.length; i++) {
    const c = str[i];
    if (c === "\\" && (str[i + 1] === "{" || str[i + 1] === "}")) {
      i++; // escaped brace pair — literal character, not a grouping delimiter
      continue;
    }
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1; // unbalanced
};

// Net \begin{}/\end{} balance (name-agnostic — just checks nesting depth).
const envBalance = (str) => {
  let depth = 0;
  let i = 0;
  while (i < str.length) {
    const rest = str.slice(i);
    const b = /^\\begin\{[a-zA-Z*]+\}/.exec(rest);
    if (b) {
      depth++;
      i += b[0].length;
      continue;
    }
    const e = /^\\end\{[a-zA-Z*]+\}/.exec(rest);
    if (e) {
      depth--;
      i += e[0].length;
      continue;
    }
    i++;
  }
  return depth;
};

// ─── Strip a pure line-wrapping outer container ────────────────────────────
// \displaylines{...} and \begin{array}{l}...\end{array} carry no math
// meaning of their own — they just join several text/math lines. Any OTHER
// environment (pmatrix, cases, aligned, a multi-column array, ...) is real
// math structure and must be left completely alone.
const stripOuterWrapper = (latex) => {
  const trimmed = latex.trim();

  if (trimmed.startsWith("\\displaylines{")) {
    const openIdx = trimmed.indexOf("{");
    const closeIdx = findMatchingBrace(trimmed, openIdx);
    if (closeIdx === trimmed.length - 1) {
      return trimmed.slice(openIdx + 1, closeIdx);
    }
  }

  const arrayPrefix = "\\begin{array}{l}";
  const arraySuffix = "\\end{array}";
  if (
    trimmed.startsWith(arrayPrefix) &&
    trimmed.endsWith(arraySuffix) &&
    trimmed.length > arrayPrefix.length + arraySuffix.length
  ) {
    const inner = trimmed.slice(
      arrayPrefix.length,
      trimmed.length - arraySuffix.length,
    );
    if (envBalance(inner) === 0) return inner;
  }

  return trimmed;
};

// ─── Split into top-level lines ────────────────────────────────────────────
// Only a `\\` at brace-depth 0 AND outside any \begin{...}...\end{...} is a
// real line break, so a matrix/cases/aligned block's own `\\` rows survive
// intact even when sitting inside a displaylines/array wrapper next to plain
// text lines.
const splitTopLevelLines = (str) => {
  const lines = [];
  let current = "";
  let braceDepth = 0;
  let envDepth = 0;
  let i = 0;
  const n = str.length;

  while (i < n) {
    const c = str[i];

    if (c === "\\") {
      const next = str[i + 1];

      if (next === "{" || next === "}") {
        current += c + next;
        i += 2;
        continue;
      }

      const beginMatch = /^\\begin\{[a-zA-Z*]+\}/.exec(str.slice(i));
      if (beginMatch) {
        envDepth++;
        current += beginMatch[0];
        i += beginMatch[0].length;
        continue;
      }

      const endMatch = /^\\end\{[a-zA-Z*]+\}/.exec(str.slice(i));
      if (endMatch) {
        envDepth = Math.max(0, envDepth - 1);
        current += endMatch[0];
        i += endMatch[0].length;
        continue;
      }

      if (next === "\\") {
        if (braceDepth === 0 && envDepth === 0) {
          lines.push(current);
          current = "";
          i += 2;
          const spacing = /^\[[^\]]*\]/.exec(str.slice(i));
          if (spacing) i += spacing[0].length; // consume \\[10pt]-style spacing
          continue;
        }
        current += "\\\\";
        i += 2;
        continue;
      }

      current += c;
      i += 1;
      continue;
    }

    if (c === "{") {
      braceDepth++;
      current += c;
      i++;
      continue;
    }
    if (c === "}") {
      braceDepth = Math.max(0, braceDepth - 1);
      current += c;
      i++;
      continue;
    }

    // A literal newline (e.g. pasted content) also acts as a line break.
    if (c === "\n" && braceDepth === 0 && envDepth === 0) {
      lines.push(current);
      current = "";
      i++;
      continue;
    }

    current += c;
    i++;
  }

  lines.push(current);
  return lines.map((l) => l.trim()).filter((l) => l.length > 0);
};

// ─── Extract {type:'text'|'math', value} segments from one line ───────────
// \text{...} only acts as a text/math boundary at the OUTERMOST level of the
// line. Nested inside \frac{}{}, \sqrt{}, or (especially) inside an
// environment like \begin{cases}...\end{cases} — e.g. a piecewise function's
// \text{if } labels — it stays embedded in the math so KaTeX renders it as
// part of that structure, instead of tearing the structure apart.
const extractSegments = (line) => {
  const segments = [];
  const TAG = "\\text{";
  let mathBuffer = "";
  let braceDepth = 0;
  let envDepth = 0;
  let i = 0;
  const n = line.length;

  const pushMath = (raw) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      if (raw.length > 0 && segments.length > 0) {
        segments.push({ type: "text", value: " " });
      }
      return;
    }
    segments.push({ type: "math", value: trimmed });
  };

  while (i < n) {
    const rest = line.slice(i);

    if (braceDepth === 0 && envDepth === 0 && rest.startsWith(TAG)) {
      pushMath(mathBuffer);
      mathBuffer = "";

      const openBraceIdx = i + TAG.length - 1;
      const closeIdx = findMatchingBrace(line, openBraceIdx);
      if (closeIdx === -1) {
        // Unterminated \text{ — bail safely; surfaces as a (gracefully
        // handled) KaTeX render error rather than crashing.
        pushMath(line.slice(i));
        return segments;
      }

      segments.push({
        type: "text",
        value: unescapeLatexText(line.slice(openBraceIdx + 1, closeIdx)),
      });
      i = closeIdx + 1;
      continue;
    }

    const c = line[i];

    if (c === "\\" && (line[i + 1] === "{" || line[i + 1] === "}")) {
      mathBuffer += c + line[i + 1];
      i += 2;
      continue;
    }

    const beginMatch = /^\\begin\{[a-zA-Z*]+\}/.exec(rest);
    if (beginMatch) {
      envDepth++;
      mathBuffer += beginMatch[0];
      i += beginMatch[0].length;
      continue;
    }
    const endMatch = /^\\end\{[a-zA-Z*]+\}/.exec(rest);
    if (endMatch) {
      envDepth = Math.max(0, envDepth - 1);
      mathBuffer += endMatch[0];
      i += endMatch[0].length;
      continue;
    }

    if (c === "{") {
      braceDepth++;
      mathBuffer += c;
      i++;
      continue;
    }
    if (c === "}") {
      braceDepth = Math.max(0, braceDepth - 1);
      mathBuffer += c;
      i++;
      continue;
    }

    mathBuffer += c;
    i++;
  }

  pushMath(mathBuffer);
  return segments;
};

// ─── Is this math string, on its own, a whole \begin{ENV}...\end{ENV}? ────
// Used to decide whether a line should render as BlockMath (its sole
// content is one complete environment) vs InlineMath (embedded in running
// text, or just a plain expression).
const BLOCK_ENV_RE =
  /^\\begin\{(pmatrix|bmatrix|vmatrix|Vmatrix|matrix|smallmatrix|cases|aligned|align\*?|alignat\*?|gathered|gather\*?|array|multline\*?|eqnarray\*?)\}/;

const isWholeEnvironment = (mathStr) => {
  if (!BLOCK_ENV_RE.test(mathStr)) return false;

  let envDepth = 0;
  let i = 0;
  const n = mathStr.length;
  let matchEnd = -1;

  while (i < n) {
    const rest = mathStr.slice(i);
    const b = /^\\begin\{[a-zA-Z*]+\}/.exec(rest);
    if (b) {
      envDepth++;
      i += b[0].length;
      continue;
    }
    const e = /^\\end\{[a-zA-Z*]+\}/.exec(rest);
    if (e) {
      envDepth--;
      i += e[0].length;
      if (envDepth === 0) {
        matchEnd = i;
        break;
      }
      continue;
    }
    i++;
  }

  if (matchEnd === -1) return false;
  return mathStr.slice(matchEnd).trim().length === 0;
};

// ─── React rendering ────────────────────────────────────────────────────────
const rowStyle = {
  textAlign: "left",
  width: "100%",
  maxWidth: "100%",
  overflowWrap: "break-word",
};

const PlainWrapped = ({ children }) => (
  <div className="whitespace-pre-wrap break-words" style={rowStyle}>
    {children}
  </div>
);

// Scoped override so block-level KaTeX (matrices, cases, aligned steps...)
// stays left-aligned and compact instead of KaTeX's default centered,
// margin-heavy display style, with horizontal scroll as a safety net
// instead of blowing out the page on a wide matrix/array.
const katexBlockStyles = `
  .custom-katex-left .katex-display { text-align: left !important; margin: 0 !important; }
`;

// A bad/incomplete LaTeX snippet (mid-edit, or content that predates this
// parser) shows its raw source in a small tag instead of a raw KaTeX error
// box, so one bad question/option doesn't visually break the rest of a list.
const renderMathError = (source) => (error) => {
  console.error("KaTeX render error:", error?.message, "in:", source);
  return (
    <span
      className="text-black bg-yellow-100 p-2 rounded text-xs font-mono break-all"
      title={error?.message}
    >
      {source}
    </span>
  );
};

const renderLine = (segments, key) => {
  const isPureText = segments.every((s) => s.type === "text");

  if (isPureText) {
    return (
      <div
        key={key}
        className="whitespace-pre-wrap break-words"
        style={rowStyle}
      >
        {segments.map((s) => s.value).join("")}
      </div>
    );
  }

  const isSoleBlockMath =
    segments.length === 1 &&
    segments[0].type === "math" &&
    isWholeEnvironment(segments[0].value);

  if (isSoleBlockMath) {
    return (
      <div
        key={key}
        className="custom-katex-left"
        style={{ ...rowStyle, overflowX: "visible" }}
      >
        <style>{katexBlockStyles}</style>
        <BlockMath
          math={segments[0].value}
          renderError={renderMathError(segments[0].value)}
        />
      </div>
    );
  }

  return (
    <div
      key={key}
      className="whitespace-normal break-words font-custom"
      style={{ ...rowStyle, overflowX: "visible" }}
    >
      {segments.map((s, idx) =>
        s.type === "text" ? (
          <React.Fragment key={idx}>{s.value}</React.Fragment>
        ) : (
          <InlineMath
            key={idx}
            math={s.value}
            renderError={renderMathError(s.value)}
          />
        ),
      )}
    </div>
  );
};

const renderMathText = (text) => {
  if (text === null || text === undefined) return null;
  const raw = typeof text === "string" ? text : String(text);
  const content = raw.trim();
  if (!content) return null;

  try {
    if (
      !(content.startsWith("$") && content.endsWith("$") && content.length >= 2)
    ) {
      return <PlainWrapped>{content}</PlainWrapped>;
    }

    const latex = content.slice(1, -1).trim();
    if (!latex) return null;

    const body = stripOuterWrapper(latex);
    const lines = splitTopLevelLines(body);
    if (lines.length === 0) return null;

    const parsedLines = lines.map(extractSegments);

    return (
      <div className="space-y-1.5" style={rowStyle}>
        {parsedLines.map((segs, i) => renderLine(segs, i))}
      </div>
    );
  } catch (error) {
    // Should be unreachable (the parsing above never throws), but keep this
    // as a hard safety net so a preview can never crash the question list.
    console.error("renderMathText error:", error);
    return <PlainWrapped>{raw}</PlainWrapped>;
  }
};

export default renderMathText;
