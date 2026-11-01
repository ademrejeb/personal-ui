import type { Category, ComponentEntry } from "./types";
import { CATEGORY_ORDER } from "./types";
import { layoutEntries } from "./layout";
import { typographyEntries } from "./typography";
import { actionsEntries } from "./actions";
import { formsEntries } from "./forms";
import { feedbackEntries } from "./feedback";
import { overlaysEntries } from "./overlays";
import { navigationEntries } from "./navigation";
import { dataDisplayEntries } from "./data-display";
import { applicationEntries } from "./application";
import { iconEntries } from "./icons";

export type { Category, ComponentEntry, Control, DemoState, PropDoc } from "./types";
export { CATEGORY_ORDER } from "./types";
export { generateCode } from "../lib/jsx";
export { initialState } from "./demo";

/** All documented components, in authoring order. */
export const registry: ComponentEntry[] = [
  ...layoutEntries,
  ...typographyEntries,
  ...actionsEntries,
  ...formsEntries,
  ...feedbackEntries,
  ...overlaysEntries,
  ...navigationEntries,
  ...dataDisplayEntries,
  ...applicationEntries,
  ...iconEntries,
];

const byId = new Map(registry.map((entry) => [entry.id, entry]));

/** Look up a component by slug. */
export function getEntry(id: string): ComponentEntry | undefined {
  return byId.get(id);
}

export interface CategoryGroup {
  category: Category;
  entries: ComponentEntry[];
}

/** Registry grouped by category, in canonical order. */
export function groupedRegistry(): CategoryGroup[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    entries: registry.filter((entry) => entry.category === category),
  })).filter((group) => group.entries.length > 0);
}

/** Simple ranked search across name, description, and keywords. */
export function searchRegistry(query: string): ComponentEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return registry;
  const scored = registry.map((entry) => {
    const name = entry.name.toLowerCase();
    const haystack = [entry.name, entry.description, ...(entry.keywords ?? [])]
      .join(" ")
      .toLowerCase();
    let score = 0;
    if (name === q) score = 100;
    else if (name.startsWith(q)) score = 80;
    else if (name.includes(q)) score = 60;
    else if (haystack.includes(q)) score = 30;
    return { entry, score };
  });
  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.entry);
}
