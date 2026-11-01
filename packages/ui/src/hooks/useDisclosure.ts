import { useCallback } from "react";
import { useControllableState, type SetStateAction } from "./useControllableState";

export interface UseDisclosureOptions {
  /** Controlled open state. */
  open?: boolean;
  /** Initial state when uncontrolled. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface UseDisclosureResult {
  open: boolean;
  setOpen: (next: SetStateAction<boolean>) => void;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
}

/**
 * Headless open/close state for popovers, modals, sheets, and inline panels.
 * Works controlled or uncontrolled and avoids the repeated
 * `useState` + three-callback boilerplate.
 */
export function useDisclosure({
  open,
  defaultOpen = false,
  onOpenChange,
}: UseDisclosureOptions = {}): UseDisclosureResult {
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const onOpen = useCallback(() => setOpen(true), [setOpen]);
  const onClose = useCallback(() => setOpen(false), [setOpen]);
  const onToggle = useCallback(() => setOpen((previous) => !previous), [setOpen]);

  return { open: isOpen, setOpen, onOpen, onClose, onToggle };
}
