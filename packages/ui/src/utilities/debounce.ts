export interface DebouncedFn<Args extends unknown[]> {
  (...args: Args): void;
  cancel: () => void;
  flush: () => void;
  pending: () => boolean;
}

/**
 * Trailing-edge debounce with `cancel` and `flush` controls. Typed without
 * `any` and safe for SSR (uses `setTimeout` only).
 */
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  wait = 200,
): DebouncedFn<Args> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Args | null = null;

  const invoke = () => {
    timer = null;
    if (lastArgs) {
      const args = lastArgs;
      lastArgs = null;
      fn(...args);
    }
  };

  const debounced = ((...args: Args) => {
    lastArgs = args;
    if (timer) clearTimeout(timer);
    timer = setTimeout(invoke, wait);
  }) as DebouncedFn<Args>;

  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    lastArgs = null;
  };

  debounced.flush = () => {
    if (timer) {
      clearTimeout(timer);
      invoke();
    }
  };

  debounced.pending = () => timer !== null;
  return debounced;
}

/** Leading-edge throttle. */
export function throttle<Args extends unknown[]>(
  fn: (...args: Args) => void,
  wait = 200,
): (...args: Args) => void {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Args | null = null;

  return (...args: Args) => {
    const now = Date.now();
    const remaining = wait - (now - last);
    lastArgs = args;
    if (remaining <= 0) {
      last = now;
      const a = lastArgs;
      lastArgs = null;
      fn(...a);
    } else if (!timer) {
      timer = setTimeout(() => {
        last = Date.now();
        timer = null;
        const a = lastArgs;
        lastArgs = null;
        if (a) fn(...a);
      }, remaining);
    }
  };
}
