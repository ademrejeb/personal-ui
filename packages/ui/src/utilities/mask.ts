/**
 * Input masking primitives. A mask is a string where `9` accepts a digit,
 * `a` a letter and `*` any alphanumeric character; everything else is a literal.
 * A literal can be escaped with a backslash.
 */

export type MaskToken = "9" | "a" | "*";

export type MaskEntry =
  | { kind: "literal"; char: string }
  | { kind: "token"; token: MaskToken };

const DIGIT = /[0-9]/;
const LETTER = /[a-zA-Z]/;
const ALNUM = /[a-zA-Z0-9]/;

export function parseMask(mask: string): MaskEntry[] {
  const entries: MaskEntry[] = [];
  for (let index = 0; index < mask.length; index += 1) {
    const char = mask[index];
    if (char === "\\") {
      const next = mask[index + 1];
      if (next !== undefined) {
        entries.push({ kind: "literal", char: next });
        index += 1;
      }
      continue;
    }
    if (char === "9" || char === "a" || char === "*") {
      entries.push({ kind: "token", token: char });
      continue;
    }
    entries.push({ kind: "literal", char });
  }
  return entries;
}

export function isMaskChar(char: string, token: MaskToken): boolean {
  if (char === undefined || char === "") return false;
  if (token === "9") return DIGIT.test(char);
  if (token === "a") return LETTER.test(char);
  return ALNUM.test(char);
}

/** True when the mask is digits only, so the input can ask for a number pad. */
export function isNumericMask(mask: string): boolean {
  const tokens = parseMask(mask).filter((entry) => entry.kind === "token");
  return tokens.length > 0 && tokens.every((entry) => entry.kind === "token" && entry.token === "9");
}

/**
 * Formats `input` against `mask`. Literals are buffered and only committed once
 * the token that follows them consumes a character, so partial input never shows
 * trailing punctuation the user cannot fill yet.
 */
export function applyMask(input: string, mask: string): string {
  const entries = parseMask(mask);
  let result = "";
  let pending = "";
  let cursor = 0;

  for (const entry of entries) {
    if (entry.kind === "literal") {
      pending += entry.char;
      continue;
    }
    while (cursor < input.length && !isMaskChar(input[cursor], entry.token)) cursor += 1;
    if (cursor >= input.length) break;
    result += pending + input[cursor];
    pending = "";
    cursor += 1;
  }

  return result;
}

/** The characters a masked value actually carries, with literals removed. */
export function unmaskValue(value: string, mask: string): string {
  const entries = parseMask(mask);
  let result = "";
  let cursor = 0;

  for (const entry of entries) {
    if (cursor >= value.length) break;
    if (entry.kind === "literal") {
      if (value[cursor] === entry.char) cursor += 1;
      continue;
    }
    if (isMaskChar(value[cursor], entry.token)) {
      result += value[cursor];
      cursor += 1;
    }
  }

  return result;
}

/** True when every mask position has been filled. */
export function isMaskComplete(value: string, mask: string): boolean {
  const entries = parseMask(mask);
  let cursor = 0;

  for (const entry of entries) {
    if (cursor >= value.length) return false;
    if (entry.kind === "literal") {
      if (value[cursor] !== entry.char) return false;
      cursor += 1;
      continue;
    }
    if (!isMaskChar(value[cursor], entry.token)) return false;
    cursor += 1;
  }

  return true;
}

/** Placeholder text for a mask: `(999) 999-9999` or `__/__/____`. */
export function maskToPlaceholder(mask: string, char = "_"): string {
  return parseMask(mask)
    .map((entry) => (entry.kind === "literal" ? entry.char : char))
    .join("");
}
