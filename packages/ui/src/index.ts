"use client";

/**
 * @adem.rejeb/ui — public API.
 *
 * Import the theme once (choose one):
 *   import "@adem.rejeb/ui/styles.css"; // reset + tokens + components
 *   import "@adem.rejeb/ui/tokens.css"; // tokens only
 *
 * Every component is independently importable and tree-shakeable.
 */

/* Shared types */
export type { ControlSize, Size, Status, Align, Justify, Space } from "./types";

/* Theme */
export {
  ThemeProvider,
  useTheme,
  useOptionalTheme,
  type Theme,
  type ResolvedTheme,
  type ThemeContextValue,
  type ThemeProviderProps,
} from "./theme/ThemeProvider";
export { ThemeScript, type ThemeScriptProps } from "./theme/ThemeScript";

/* Primitives */
export { Portal, type PortalProps } from "./primitives/Portal";
export { FloatingLayer, type FloatingLayerProps } from "./primitives/FloatingLayer";

/* Hooks */
export { useControllableState, type UseControllableStateParams } from "./hooks/useControllableState";
export {
  useDisclosure,
  type UseDisclosureOptions,
  type UseDisclosureResult,
} from "./hooks/useDisclosure";
export { useEventCallback } from "./hooks/useEventCallback";
export { useMergedRefs } from "./hooks/useMergedRefs";
export { useIsomorphicLayoutEffect } from "./hooks/useIsomorphicLayoutEffect";
export {
  useMediaQuery,
  useReducedMotion,
  useBreakpoint,
  BREAKPOINTS,
  type Breakpoint,
} from "./hooks/useMediaQuery";
export { useCopyToClipboard, type UseCopyToClipboardResult } from "./hooks/useCopyToClipboard";
export { useDebouncedValue } from "./hooks/useDebouncedValue";
export { useOutsideInteraction, useClickOutside } from "./hooks/useOutsideInteraction";
export { useEscapeKey } from "./hooks/useEscapeKey";
export { useFocusTrap } from "./hooks/useFocusTrap";
export { useScrollLock } from "./hooks/useScrollLock";
export { useFloating, type UseFloatingOptions, type UseFloatingResult } from "./hooks/useFloating";
export {
  useSelection,
  type UseSelectionOptions,
  type SelectionApi,
} from "./hooks/useSelection";
export {
  useHoverCard,
  type UseHoverCardOptions,
  type HoverCardApi,
} from "./hooks/useHoverCard";
export {
  useCarousel,
  type UseCarouselOptions,
  type CarouselApi,
  type CarouselOrientation,
} from "./hooks/useCarousel";
export {
  useTree,
  getAllTreeKeys,
  getDescendantKeys,
  findTreeNode,
  flattenTree,
  type TreeItem,
  type TreeRow,
  type TreeApi,
  type TreeListProps,
  type TreeSelectionMode,
  type UseTreeOptions,
} from "./hooks/useTree";
export {
  useCascader,
  findCascaderOption,
  resolveCascaderPath,
  type CascaderColumn,
  type CascaderOption,
  type CascaderColumnPropBag,
  type CascaderOptionPropBag,
  type CascaderPopupPropBag,
  type CascaderTriggerPropBag,
  type UseCascaderOptions,
  type UseCascaderResult,
} from "./hooks/useCascader";
export {
  useTransfer,
  type TransferDirection,
  type TransferItem,
  type TransferItemPropBag,
  type TransferPanelPropBag,
  type UseTransferOptions,
  type UseTransferResult,
} from "./hooks/useTransfer";
export {
  useInputMask,
  type InputMaskPropBag,
  type UseInputMaskOptions,
  type UseInputMaskResult,
} from "./hooks/useInputMask";
export {
  useColorPicker,
  DEFAULT_COLOR_SWATCHES,
  type ColorPickerTriggerPropBag,
  type UseColorPickerOptions,
  type UseColorPickerResult,
} from "./hooks/useColorPicker";
export {
  useInlineEdit,
  type InlineEditInputProps,
  type UseInlineEditOptions,
  type UseInlineEditResult,
} from "./hooks/useInlineEdit";
export {
  useSplitPane,
  type SplitOrientation,
  type UseSplitPaneOptions,
  type UseSplitPaneResult,
} from "./hooks/useSplitPane";

/* Utilities */
export { cx, type ClassValue } from "./utilities/cx";
export {
  slotClass,
  slotConfig,
  type SlotClassNames,
  type SlotConfig,
} from "./utilities/slots";
export {
  canUseDOM,
  contains,
  getFocusableElements,
  getOwnerDocument,
  getOwnerWindow,
  isHTMLElement,
} from "./utilities/dom";
export {
  CHART_COLORS,
  arcPath,
  areaPath,
  chartColor,
  extent as chartExtent,
  formatChartValue,
  linePath,
  niceTicks,
  polarPoint,
  scaleLinear,
  sliceAngles,
  stackSeries,
  stackTotal,
  type ArcGeometry,
  type ChartPoint,
  type ChartSeriesInput,
  type DonutSlice,
} from "./utilities/chart";
export {
  applyMask,
  isMaskComplete,
  isMaskChar,
  isNumericMask,
  maskToPlaceholder,
  parseMask,
  unmaskValue,
  type MaskEntry,
  type MaskToken,
} from "./utilities/mask";
export {
  clamp as clampChannel,
  formatColor,
  hslToRgb,
  parseColor,
  readableTextColor,
  relativeLuminance,
  rgbToHsl,
  toHex,
  toHexWithAlpha,
  type ColorFormat,
  type HSL,
  type RGB,
  type RGBA,
} from "./utilities/color";
export { mergeRefs } from "./utilities/mergeRefs";
export {
  isKeySelected,
  toggleKey,
  setKeys,
  selectKeys,
  deselectKeys,
  areAllSelected,
  areSomeSelected,
  type SelectionKey,
} from "./utilities/selection";
export { copyText } from "./utilities/clipboard";
export { debounce, throttle, type DebouncedFn } from "./utilities/debounce";
export { focusFirst, focusElement, restoreFocus, trapTabKey } from "./utilities/focus";
export {
  computePosition,
  computePositionAtPoint,
  type Placement,
  type Coords,
  type Point,
} from "./utilities/position";
export { mergeDescribedBy, idSuffix, optionId } from "./utilities/aria";
export { spaceVar, alignToCss, justifyToCss } from "./utilities/space";
export { compareValues, makeStableComparator, getCollator } from "./utilities/compare";
export type { CompareKind, CompareOptions } from "./utilities/compare";
export {
  parseDateValue,
  parseWith,
  compareDateValues,
  formatDate,
  toDateOnlyString,
  startOfDay,
  endOfDay,
  addDays,
  addMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isLeapYear,
  daysInMonth,
  isSameDay,
  isSameMonth,
  isBefore,
  isAfter,
  isWithin,
  clampDate,
  differenceInDays,
  isDateDisabled,
  isDateObject,
  isValidDate,
  type DateInput,
  type DateKind,
  type ParsedDate,
  type DateDisabledConfig,
  type CompareDateOptions,
  type EmptyPosition,
} from "./utilities/date";
export {
  formatNumber,
  formatCurrency,
  formatPercent,
  formatFileSize,
  truncateText,
  slugify,
  titleCase,
} from "./utilities/format";
export { formatRelativeTime } from "./utilities/relative-time";
export type {
  PolymorphicComponent,
  PolymorphicProps,
  PolymorphicRef,
  AsProp,
} from "./utilities/polymorphic";

/* Components */
export * from "./components/icon";
export * from "./components/layout";
export * from "./components/typography";
export * from "./components/actions";
export * from "./components/forms";
export * from "./components/feedback";
export * from "./components/overlays";
export * from "./components/navigation";
export * from "./components/data-display";
export * from "./components/application";
export * from "./survey/types";
export * from "./survey/expression";
export * from "./survey/renderer";
export * from "./survey/builder";

export * from "./builder";

export { VisualFormBuilder as FormBuilderV2, type VisualFormBuilderProps as FormBuilderV2Props } from "./forms/builder";

export * from "./editor/types";
export * from "./editor/useEditor";
export * from "./editor/placeholder";
export { Editor } from "./editor/Editor";
