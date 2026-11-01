import type { ComponentEntry, DemoState, DemoValue } from "./types";

/** Read a string control value, falling back when unset. */
export function str(state: DemoState, key: string, fallback = ""): string {
  const value = state[key];
  return typeof value === "string" ? value : value == null ? fallback : String(value);
}

/** Read a boolean control value, falling back when unset. */
export function bool(state: DemoState, key: string, fallback = false): boolean {
  const value = state[key];
  return typeof value === "boolean" ? value : fallback;
}

/** Read a numeric control value, falling back when unset. */
export function num(state: DemoState, key: string, fallback = 0): number {
  const value = state[key];
  return typeof value === "number" ? value : fallback;
}

/** Read an enumerable control value, falling back when unset. */
export function pick<T extends DemoValue>(state: DemoState, key: string, fallback: T): T {
  const value = state[key];
  return (value === undefined ? fallback : value) as T;
}

/** Build the initial playground state from a component's control schema. */
export function initialState(entry: ComponentEntry): DemoState {
  const state: DemoState = {};
  for (const control of entry.controls ?? []) {
    state[control.name] = control.defaultValue;
  }
  return state;
}
