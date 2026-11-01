import { useMemo } from "react";
import { CommandPalette as UiCommandPalette } from "@adem.rejeb/ui";
import type { CommandPaletteItem } from "@adem.rejeb/ui";
import { navigate } from "../lib/router";
import { registry } from "../registry";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const items = useMemo<CommandPaletteItem[]>(
    () =>
      registry.map((entry) => ({
        id: entry.id,
        label: entry.name,
        group: entry.category,
        description: entry.description,
        keywords: entry.keywords,
      })),
    [],
  );

  return (
    <UiCommandPalette
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      onSelect={(item) => navigate(`/components/${item.id}`)}
      items={items}
      placeholder="Search components…"
      label="Component search"
      emptyMessage="No matching components"
      footer="↑↓ to navigate · ↵ to open · esc to close"
    />
  );
}
