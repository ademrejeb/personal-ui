import type { ReactNode } from "react";
import { cx } from "@personal-ui/ui";

interface PlaygroundProps {
  children: ReactNode;
  block?: boolean;
}

/** Preview surface for live component demos. */
export function Playground({ children, block = false }: PlaygroundProps) {
  return <div className={cx("lab-canvas", block && "lab-canvas--block")}>{children}</div>;
}
