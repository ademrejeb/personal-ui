import { cx, type ClassValue } from "./cx";

/**
 * Consumer-supplied class names keyed by slot. Every component declares its own
 * slot union, so `classNames={{ trigger: "…", content: "…" }}` is fully typed.
 */
export type SlotClassNames<Slots extends string> = Partial<Record<Slots, string>>;

/**
 * The customization surface shared by every component.
 *
 * - `classNames` adds classes to individual internal slots without a new CSS
 *   file or `!important`.
 * - `unstyled` drops the built-in `ui-*` classes entirely, leaving behaviour,
 *   ARIA wiring, and `data-*` state attributes intact — the headless mode. Pair
 *   it with the component's exported hook when even the markup is yours.
 */
export interface SlotConfig<Slots extends string> {
  unstyled?: boolean;
  classNames?: SlotClassNames<Slots>;
}

/**
 * Resolve one slot's class list: built-in classes (unless `unstyled`) followed
 * by the consumer's override. No conflict resolution is attempted — the design
 * system is not atomic CSS, so later classes win by source order.
 */
export function slotClass<Slots extends string>(
  config: SlotConfig<Slots>,
  slot: Slots,
  ...base: ClassValue[]
): string | undefined {
  const resolved = cx(config.unstyled ? undefined : base, config.classNames?.[slot]);
  return resolved || undefined;
}

/** Build the immutable config object components pass around internally. */
export function slotConfig<Slots extends string>(
  unstyled: boolean | undefined,
  classNames: SlotClassNames<Slots> | undefined,
): SlotConfig<Slots> {
  return { unstyled, classNames };
}
