export interface BuilderElement {
  id: string;
  type: string;
  [key: string]: unknown;
}

export interface BuilderHistory<T> {
  past: T[];
  present: T;
  future: T[];
}

export function createHistory<T>(initial: T): BuilderHistory<T> {
  return { past: [], present: initial, future: [] };
}

export function pushHistory<T>(h: BuilderHistory<T>, next: T): BuilderHistory<T> {
  return { past: [...h.past, h.present], present: next, future: [] };
}

export function undoHistory<T>(h: BuilderHistory<T>): BuilderHistory<T> {
  if (h.past.length === 0) return h;
  const prev = h.past[h.past.length - 1];
  return { past: h.past.slice(0, -1), present: prev, future: [h.present, ...h.future] };
}

export function redoHistory<T>(h: BuilderHistory<T>): BuilderHistory<T> {
  if (h.future.length === 0) return h;
  const next = h.future[0];
  return { past: [...h.past, h.present], present: next, future: h.future.slice(1) };
}
