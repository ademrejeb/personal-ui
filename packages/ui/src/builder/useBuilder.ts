import { useState, useCallback } from "react";

export interface UseBuilderOptions<T> {
  initial: T;
  onChange?: (value: T) => void;
}

export interface UseBuilderResult<T> {
  value: T;
  setValue: (next: T) => void;
  selected: string | null;
  setSelected: (id: string | null) => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  history: { past: T[]; future: T[] };
}

export function useBuilder<T>(
  _options: UseBuilderOptions<T>,
): UseBuilderResult<T> {
  // Placeholder: real implementation wires createHistory/pushHistory/undoHistory/redoHistory.
  // Kept minimal to avoid duplicating SurveyBuilder's proven history logic.
  const [value, setValueState] = useState<T>(_options.initial);
  const [selected, setSelected] = useState<string | null>(null);
  const [past, setPast] = useState<T[]>([]);
  const [future, setFuture] = useState<T[]>([]);

  const setValue = useCallback((next: T) => {
    setPast((p) => [...p, value]);
    setFuture([]);
    setValueState(next);
    _options.onChange?.(next);
  }, [value, _options]);

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p;
      const prev = p[p.length - 1];
      setFuture((f) => [value, ...f]);
      setValueState(prev);
      _options.onChange?.(prev);
      return p.slice(0, -1);
    });
  }, [value, _options]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0];
      setPast((p) => [...p, value]);
      setValueState(next);
      _options.onChange?.(next);
      return f.slice(1);
    });
  }, [value, _options]);

  return {
    value,
    setValue,
    selected,
    setSelected,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    undo,
    redo,
    history: { past, future },
  };
}

