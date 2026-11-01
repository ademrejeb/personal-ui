import { useCallback, useMemo, useRef, useState, type FormEvent } from "react";

export type FormErrors<T> = Partial<Record<keyof T & string, string>>;
export type FormTouched<T> = Partial<Record<keyof T & string, boolean>>;

export interface FormBinding {
  name: string;
  value: unknown;
  onChange: (input: unknown) => void;
  onBlur: () => void;
}

export interface CheckboxBinding {
  name: string;
  checked: boolean;
  onChange: (input: unknown) => void;
  onBlur: () => void;
}

/**
 * Erased view of a form used by `FormField` to read error/touched state without
 * knowing the value type. `UseFormReturn<T>` is assignable to this.
 */
export interface FormContextValue {
  values: Record<string, unknown>;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean | undefined>;
  isSubmitting: boolean;
  submitCount: number;
  isValid: boolean;
  setValue(name: string, value: unknown): void;
  setValues(patch: Record<string, unknown>): void;
  setTouched(name: string, touched?: boolean): void;
  setError(name: string, error?: string): void;
  reset(next?: Record<string, unknown>): void;
  submit(): Promise<void>;
  validateField(name: string): Promise<string | undefined>;
  bind(name: string): FormBinding;
  bindCheckbox(name: string): CheckboxBinding;
}

export interface UseFormOptions<T extends Record<string, unknown>> {
  initialValues: T;
  /** Sync or async validator returning a map of field → message. */
  validate?: (values: T) => FormErrors<T> | Promise<FormErrors<T>>;
  onSubmit?: (values: T) => void | Promise<void>;
  /** Validate a field as the user types. Defaults to false. */
  validateOnChange?: boolean;
  /** Validate a field on blur. Defaults to true. */
  validateOnBlur?: boolean;
}

export interface UseFormReturn<T extends Record<string, unknown>> {
  initialValues: T;
  values: T;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean | undefined>;
  isSubmitting: boolean;
  submitCount: number;
  isValid: boolean;
  /** True when the current values differ from the initial values. */
  isDirty: boolean;
  setValue<K extends keyof T & string>(name: K, value: T[K]): void;
  setValues(patch: Partial<T>): void;
  setTouched(name: keyof T & string, touched?: boolean): void;
  setError(name: keyof T & string, error?: string): void;
  reset(next?: Partial<T>): void;
  validateField(name: keyof T & string): Promise<string | undefined>;
  submit(): Promise<void>;
  handleSubmit(event?: FormEvent | { preventDefault(): void }): void;
  bind<K extends keyof T & string>(name: K): FormBinding & { value: T[K] };
  bindCheckbox<K extends keyof T & string>(name: K): CheckboxBinding & { checked: boolean };
}

export interface FormState<T> {
  values: T;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean | undefined>;
  isSubmitting: boolean;
  submitCount: number;
  isValid: boolean;
  isDirty: boolean;
}

function extractChangeValue(input: unknown): unknown {
  if (input && typeof input === "object" && "target" in input) {
    const target = (input as { target: Record<string, unknown> }).target;
    const type = target.type as string | undefined;
    if (type === "checkbox" || type === "radio") return target.checked;
    // `valueAsNumber` is NaN for text-like inputs, so only trust it for numeric
    // field types.
    if (
      (type === "number" || type === "range") &&
      typeof target.valueAsNumber === "number" &&
      !Number.isNaN(target.valueAsNumber)
    ) {
      return target.valueAsNumber;
    }
    return target.value;
  }
  return input;
}

/**
 * Minimal, dependency-free form state engine: values, per-field errors and
 * touched flags, sync/async validation, and submission. Field state can be read
 * by `FormField` via `name` so labels and error messages wire up automatically.
 */
export function useForm<T extends Record<string, unknown>>({
  initialValues,
  validate,
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true,
}: UseFormOptions<T>): UseFormReturn<T> {
  const initialRef = useRef(initialValues);
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouchedState] = useState<Record<string, boolean | undefined>>({});
  const [isSubmitting, setSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  const valuesRef = useRef(values);
  valuesRef.current = values;
  const touchedRef = useRef(touched);
  touchedRef.current = touched;

  const runValidate = useCallback(
    async (next: T): Promise<Record<string, string | undefined>> => {
      if (!validate) return {};
      return (await validate(next)) as Record<string, string | undefined>;
    },
    [validate],
  );

  const setValue = useCallback(<K extends keyof T & string>(name: K, value: T[K]) => {
    setValuesState((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
    if (validateOnChange && validate) {
      const next = { ...valuesRef.current, [name]: value };
      void runValidate(next).then((result) => {
        setErrors((prev) => ({ ...prev, [name]: result[name] }));
      });
    }
  }, [runValidate, validate, validateOnChange]);

  const setValues = useCallback((patch: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...patch }));
  }, []);

  const setTouched = useCallback((name: string, value = true) => {
    setTouchedState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setError = useCallback((name: string, error?: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const validateField = useCallback(
    async (name: string) => {
      const result = await runValidate(valuesRef.current);
      setErrors((prev) => ({ ...prev, [name]: result[name] }));
      return result[name];
    },
    [runValidate],
  );

  const reset = useCallback((next?: Partial<T>) => {
    setValuesState({ ...initialRef.current, ...next });
    setErrors({});
    setTouchedState({});
    setSubmitting(false);
    setSubmitCount(0);
  }, []);

  const submit = useCallback(async () => {
    setSubmitCount((c) => c + 1);
    setSubmitting(true);
    const result = await runValidate(valuesRef.current);
    setErrors(result);
    const allTouched = Object.keys(valuesRef.current).reduce<Record<string, boolean>>((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouchedState(allTouched);
    const hasErrors = Object.values(result).some(Boolean);
    if (!hasErrors && onSubmit) {
      await onSubmit(valuesRef.current);
    }
    setSubmitting(false);
  }, [onSubmit, runValidate]);

  const handleSubmit = useCallback(
    (event?: FormEvent | { preventDefault(): void }) => {
      event?.preventDefault();
      void submit();
    },
    [submit],
  );

  const bind = useCallback(
    <K extends keyof T & string>(name: K): FormBinding & { value: T[K] } => ({
      name,
      value: valuesRef.current[name],
      onChange: (input: unknown) => {
        const extracted = extractChangeValue(input);
        setValuesState((prev) => ({ ...prev, [name]: extracted }) as T);
        setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
        if (validateOnChange) void validateField(name);
      },
      onBlur: () => {
        setTouched(name);
        if (validateOnBlur) void validateField(name);
      },
    }),
    [setTouched, validateField, validateOnBlur, validateOnChange],
  );

  const bindCheckbox = useCallback(
    <K extends keyof T & string>(name: K): CheckboxBinding & { checked: boolean } => ({
      name,
      checked: Boolean(valuesRef.current[name as keyof T & string]),
      onChange: (input: unknown) => {
        const extracted = Boolean(extractChangeValue(input));
        setValuesState((prev) => ({ ...prev, [name]: extracted }) as T);
      },
      onBlur: () => {
        setTouched(name);
        if (validateOnBlur) void validateField(name);
      },
    }),
    [setTouched, validateField, validateOnBlur],
  );

  const isValid = useMemo(() => Object.values(errors).every((error) => !error), [errors]);
  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initialRef.current),
    [values],
  );

  return {
    initialValues: initialRef.current,
    values,
    errors,
    touched,
    isSubmitting,
    submitCount,
    isValid,
    isDirty,
    setValue,
    setValues,
    setTouched,
    setError,
    reset,
    validateField,
    submit,
    handleSubmit,
    bind,
    bindCheckbox,
  };
}

/**
 * Subscribe to a single field's value. Because `useForm` keeps values in React
 * state, reading through this hook re-renders only when the form re-renders and
 * makes the dependency explicit at the call site.
 */
export function useWatch<T extends Record<string, unknown>, K extends keyof T & string>(
  form: UseFormReturn<T>,
  name: K,
): T[K] {
  return form.values[name];
}

/** Narrow, memo-free view of the whole form's state for render-only consumers. */
export function useFormState<T extends Record<string, unknown>>(
  form: UseFormReturn<T>,
): FormState<T> {
  return {
    values: form.values,
    errors: form.errors,
    touched: form.touched,
    isSubmitting: form.isSubmitting,
    submitCount: form.submitCount,
    isValid: form.isValid,
    isDirty: form.isDirty,
  };
}

export interface FieldArrayItem<Item> {
  id: string;
  index: number;
  value: Item;
}

export interface UseFieldArrayReturn<Item> {
  fields: FieldArrayItem<Item>[];
  append(value: Item): void;
  prepend(value: Item): void;
  insert(index: number, value: Item): void;
  remove(index: number): void;
  move(from: number, to: number): void;
  swap(a: number, b: number): void;
  update(index: number, value: Item): void;
  replace(values: Item[]): void;
}

/**
 * Manage an array field (repeater rows) inside a form. Values live in the form
 * (so validation and submission see them); this hook adds stable ids and the
 * usual array operations.
 */
export function useFieldArray<
  T extends Record<string, unknown>,
  K extends keyof T & string,
  Item = T[K] extends (infer U)[] ? U : never,
>(form: UseFormReturn<T>, name: K): UseFieldArrayReturn<Item> {
  const nextId = useRef(0);
  const idsRef = useRef<string[]>([]);
  const list = (form.values[name] as unknown as Item[] | undefined) ?? [];

  if (idsRef.current.length !== list.length) {
    idsRef.current = list.map(
      (_, index) => idsRef.current[index] ?? `field-array-${nextId.current++}`,
    );
  }

  const commit = useCallback(
    (next: Item[]) => {
      form.setValue(name, next as T[K]);
    },
    [form, name],
  );

  const fields = list.map((value, index) => ({
    id: idsRef.current[index] ?? `field-array-${index}`,
    index,
    value,
  }));

  const op = {
    append: (value: Item) => commit([...list, value]),
    prepend: (value: Item) => commit([value, ...list]),
    insert: (index: number, value: Item) => {
      const next = [...list];
      next.splice(index, 0, value);
      commit(next);
    },
    remove: (index: number) => commit(list.filter((_, i) => i !== index)),
    move: (from: number, to: number) => {
      const next = [...list];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      commit(next);
    },
    swap: (a: number, b: number) => {
      const next = [...list];
      const temp = next[a];
      next[a] = next[b];
      next[b] = temp;
      commit(next);
    },
    update: (index: number, value: Item) =>
      commit(list.map((item, i) => (i === index ? value : item))),
    replace: (values: Item[]) => commit(values),
  };

  return { fields, ...op };
}

/** Everything a single field needs, including ready-to-spread bindings. */
export interface FieldApi<T extends Record<string, unknown>, K extends keyof T & string> {
  name: K;
  value: T[K];
  error: string | undefined;
  touched: boolean;
  invalid: boolean;
  setValue(value: T[K]): void;
  setError(error?: string): void;
  setTouched(touched?: boolean): void;
  /** Spread onto a text-like control: `{ name, value, onChange, onBlur }`. */
  bind: FormBinding & { value: T[K] };
  /** Spread onto a checkbox/switch: `{ name, checked, onChange, onBlur }`. */
  bindCheckbox: CheckboxBinding & { checked: boolean };
}

/**
 * Read and write a single field without re-deriving the wiring by hand. The
 * returned `bind`/`bindCheckbox` objects can be spread straight onto a control.
 */
export function useField<T extends Record<string, unknown>, K extends keyof T & string>(
  form: UseFormReturn<T>,
  name: K,
): FieldApi<T, K> {
  const error = form.errors[name];
  return {
    name,
    value: form.values[name],
    error,
    touched: Boolean(form.touched[name]),
    invalid: Boolean(error),
    setValue: (value) => form.setValue(name, value),
    setError: (next) => form.setError(name, next),
    setTouched: (next = true) => form.setTouched(name, next),
    bind: form.bind(name),
    bindCheckbox: form.bindCheckbox(name),
  };
}

export interface ControllerOptions<Value> {
  /** Transform the raw control input (event or value) before it is stored. */
  transform?: (input: unknown) => Value;
  /** Field-level validator; its message is written to the form's error state. */
  validate?: (value: Value) => string | undefined | Promise<string | undefined>;
  /** Mark the field touched as soon as it changes. Defaults to blur only. */
  touchOnChange?: boolean;
}

export interface ControllerField<Value> {
  name: string;
  value: Value;
  onChange: (input: unknown) => void;
  onBlur: () => void;
}

export interface ControllerFieldState {
  error: string | undefined;
  touched: boolean;
  invalid: boolean;
  isDirty: boolean;
}

export interface UseControllerReturn<T extends Record<string, unknown>, K extends keyof T & string> {
  field: ControllerField<T[K]>;
  fieldState: ControllerFieldState;
  setValue(value: T[K]): void;
  setError(error?: string): void;
}

/**
 * RHF-shaped controlled-field primitive built on the form engine. Owns the
 * change/blur plumbing, optional value transform, and field-level validation so
 * custom controls stay declarative.
 */
export function useController<T extends Record<string, unknown>, K extends keyof T & string>(
  form: UseFormReturn<T>,
  name: K,
  options: ControllerOptions<T[K]> = {},
): UseControllerReturn<T, K> {
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const value = form.values[name];
  const valueRef = useRef(value);
  valueRef.current = value;
  const error = form.errors[name];

  const runValidate = useCallback(
    (next: T[K]) => {
      const validate = optionsRef.current.validate;
      if (!validate) return;
      const result = validate(next);
      if (typeof result === "string") {
        form.setError(name, result);
        return;
      }
      if (result && typeof (result as Promise<string | undefined>).then === "function") {
        void (result as Promise<string | undefined>).then((message) => form.setError(name, message));
        return;
      }
      form.setError(name, undefined);
    },
    [form, name],
  );

  const onChange = useCallback(
    (input: unknown) => {
      const transform = optionsRef.current.transform;
      const next = (transform ? transform(input) : extractChangeValue(input)) as T[K];
      form.setValue(name, next);
      if (optionsRef.current.touchOnChange) form.setTouched(name, true);
      if (optionsRef.current.validate) runValidate(next);
    },
    [form, name, runValidate],
  );

  const onBlur = useCallback(() => {
    form.setTouched(name, true);
    if (optionsRef.current.validate) runValidate(valueRef.current);
  }, [form, name, runValidate]);

  const initial = form.initialValues[name];
  const isDirty = JSON.stringify(value) !== JSON.stringify(initial);

  return {
    field: { name, value, onChange, onBlur },
    fieldState: { error, touched: Boolean(form.touched[name]), invalid: Boolean(error), isDirty },
    setValue: (next) => form.setValue(name, next),
    setError: (next) => form.setError(name, next),
  };
}
