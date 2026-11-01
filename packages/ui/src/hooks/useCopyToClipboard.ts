import { useCallback, useEffect, useRef, useState } from "react";
import { copyText } from "../utilities/clipboard";

export interface UseCopyToClipboardOptions {
  /** How long the `copied` flag stays true, in ms. */
  timeout?: number;
}

export interface UseCopyToClipboardResult {
  copied: boolean;
  error: boolean;
  copy: (value: string) => Promise<boolean>;
}

/**
 * Copies text and exposes transient `copied` / `error` flags with automatic
 * cleanup on unmount.
 */
export function useCopyToClipboard({
  timeout = 1600,
}: UseCopyToClipboardOptions = {}): UseCopyToClipboardResult {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(
    async (value: string) => {
      const ok = await copyText(value);
      setCopied(ok);
      setError(!ok);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setCopied(false);
        setError(false);
      }, timeout);
      return ok;
    },
    [timeout],
  );

  return { copied, error, copy };
}
