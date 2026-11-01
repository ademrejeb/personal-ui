import type { ReactNode } from "react";
import { cx } from "@adem.rejeb/ui";

interface PlaygroundProps {
  children: ReactNode;
  block?: boolean;
}

/** Preview surface for live component demos. */
export function Playground({ children, block = false }: PlaygroundProps) {
  return <div className={cx("lab-canvas", block && "lab-canvas--block")}>{children}</div>;
}
