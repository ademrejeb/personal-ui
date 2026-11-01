/** Colour parsing, conversion and formatting used by the ColourPicker. */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface RGBA extends RGB {
  a: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export type ColorFormat = "hex" | "rgb" | "hsl";

export function clamp(value: number, min = 0, max = 255): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, precision = 0): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

const HEX = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/** Parses hex, `rgb()`/`rgba()` and `hsl()`/`hsla()` strings. */
export function parseColor(input: string): RGBA | null {
  const value = input.trim().toLowerCase();
  if (!value) return null;

  const hex = HEX.exec(value);
  if (hex) {
    const digits = hex[1];
    if (digits.length === 3 || digits.length === 4) {
      const [r, g, b, a] = digits.split("").map((digit) => parseInt(digit + digit, 16));
      return { r, g, b, a: a === undefined ? 1 : round(a / 255, 2) };
    }
    const r = parseInt(digits.slice(0, 2), 16);
    const g = parseInt(digits.slice(2, 4), 16);
    const b = parseInt(digits.slice(4, 6), 16);
    const a = digits.length === 8 ? round(parseInt(digits.slice(6, 8), 16) / 255, 2) : 1;
    return { r, g, b, a };
  }

  const functional = /^(rgba?|hsla?)\(([^)]+)\)$/.exec(value);
  if (!functional) return null;
  const [kind, body] = [functional[1], functional[2]];
  const parts = body
    .split(/[\s,/]+/)
    .filter(Boolean)
    .map((part) => (part.endsWith("%") ? Number(part.slice(0, -1)) : Number(part)));

  if (parts.some((part) => Number.isNaN(part))) return null;
  const alpha = parts[3] === undefined ? 1 : clamp(parts[3], 0, 1);

  if (kind.startsWith("rgb")) {
    return {
      r: clamp(round(parts[0])),
      g: clamp(round(parts[1])),
      b: clamp(round(parts[2])),
      a: alpha,
    };
  }

  const hsl = { h: parts[0] ?? 0, s: clamp(parts[1] ?? 0, 0, 100), l: clamp(parts[2] ?? 0, 0, 100) };
  return { ...hslToRgb(hsl), a: alpha };
}

export function toHex({ r, g, b }: RGB): string {
  const part = (value: number) => clamp(round(value)).toString(16).padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`;
}

export function toHexWithAlpha({ r, g, b, a }: RGBA): string {
  if (a >= 1) return toHex({ r, g, b });
  return `${toHex({ r, g, b })}${clamp(round(a * 255)).toString(16).padStart(2, "0")}`;
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const red = clamp(r) / 255;
  const green = clamp(g) / 255;
  const blue = clamp(b) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    if (max === red) h = ((green - blue) / delta) % 6;
    else if (max === green) h = (blue - red) / delta + 2;
    else h = (red - green) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  return { h: round(h), s: round(s * 100), l: round(l * 100) };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const hue = ((h % 360) + 360) % 360;
  const saturation = clamp(s, 0, 100) / 100;
  const lightness = clamp(l, 0, 100) / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const secondary = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const match = lightness - chroma / 2;

  const [r, g, b] =
    hue < 60
      ? [chroma, secondary, 0]
      : hue < 120
        ? [secondary, chroma, 0]
        : hue < 180
          ? [0, chroma, secondary]
          : hue < 240
            ? [0, secondary, chroma]
            : hue < 300
              ? [secondary, 0, chroma]
              : [chroma, 0, secondary];

  return {
    r: clamp(round((r + match) * 255)),
    g: clamp(round((g + match) * 255)),
    b: clamp(round((b + match) * 255)),
  };
}

/** Formats a colour as hex, `rgb()`/`rgba()` or `hsl()`/`hsla()`. */
export function formatColor(color: RGBA, format: ColorFormat = "hex"): string {
  if (format === "hex") return toHexWithAlpha(color);
  const { r, g, b, a } = color;
  const alpha = round(a, 2);
  if (format === "rgb") {
    return alpha < 1
      ? `rgba(${clamp(round(r))}, ${clamp(round(g))}, ${clamp(round(b))}, ${alpha})`
      : `rgb(${clamp(round(r))}, ${clamp(round(g))}, ${clamp(round(b))})`;
  }
  const hsl = rgbToHsl(color);
  return alpha < 1
    ? `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alpha})`
    : `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

/** WCAG relative luminance, used to pick a readable tick colour on a swatch. */
export function relativeLuminance({ r, g, b }: RGB): number {
  const channel = (value: number) => {
    const scaled = clamp(value) / 255;
    return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function readableTextColor(color: RGB): "#000000" | "#ffffff" {
  return relativeLuminance(color) > 0.45 ? "#000000" : "#ffffff";
}
