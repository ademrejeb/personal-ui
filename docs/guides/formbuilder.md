# Forms guide (engine, FormField, FormBuilder)

The form layer is three cooperating pieces:

1. **`useForm`** (`forms/form-engine.ts`) — the state engine: values, errors,
   touched, submission, and the small hooks around it.
2. **`Form` + `FormField`** — context wiring and accessible field chrome
   (label, description, error, required marker).
3. **`FormBuilder`** — an optional schema grid that renders and wires controls
   for you.

Styles are `ui-form*` / `ui-form-field*` / `ui-form-builder*` in
`styles/components/forms.css`.

## `useForm`

```tsx
const form = useForm({
  initialValues: { name: "", email: "", terms: false },
  validate: (values) => ({
    ...(values.email && !values.email.includes("@") ? { email: "Enter a valid email" } : {}),
  }),
  onSubmit: (values) => save(values),
});
```

| Option | Notes |
| --- | --- |
| `initialValues` | Required; also the dirty baseline. |
| `validate` | Whole-form validator, sync or async, returning a `{ field: message }` map. |
| `onSubmit` | Runs only after validation passes; may be async. |
| `validateOnChange` / `validateOnBlur` | Re-run validation on those events (both default on). |

The return value (`UseFormReturn<T>`) exposes `values`, `errors`, `touched`,
`isSubmitting`, `submitCount`, `isValid`, `isDirty`, the actions
`setValue` / `setValues` / `setTouched` / `setError` / `reset` / `submit` /
`handleSubmit` / `validateField`, plus `bind` / `bindCheckbox` for spreading onto
controls. `handleSubmit` accepts a form event or a bare `{ preventDefault() }`,
so it doubles as an `<form onSubmit>` handler.

`Form` provides the engine through context; `FormField`/`FormActions` and the
hooks below read it. Errors only surface once a field is touched or the form has
been submitted, so users are not scolded mid-typing.

## Field hooks

| Hook | Use it for |
| --- | --- |
| `useField(form, name)` | One field's `value`/`error`/`touched` plus `bind`/`bindCheckbox` and setters. |
| `useController(form, name, { transform, validate, touchOnChange })` | A **controlled** field: normalise input with `transform`, run a field-level `validate`, and read `fieldState`. |
| `useWatch(form, name)` | Subscribe to a single value without re-rendering on unrelated changes. |
| `useFormState(form, selector?)` | Subscribe to a slice of the form state. |
| `useFieldArray({ form, name })` | Repeater rows: `fields`, `append`, `prepend`, `insert`, `remove`, `move`, `swap`, `update`, `replace`. |

`useController` is the bridge for third-party or bespoke controls:

```tsx
const { field, fieldState } = useController(form, "amount", {
  transform: (input) => Number(input) || 0,
  validate: (value) => (value > 0 ? undefined : "Must be positive"),
});
```

## `FormField`

```tsx
<FormField name="email" label="Email" description="We never share it." required>
  <Input type="email" {...form.bind("email")} />
</FormField>
```

It renders the `<label>` (associated by id), the description, and the error text,
and wires `aria-invalid` / `aria-describedby` / `required` for you. Error
messages are announced through a `role="alert"` region. Passing an explicit
`error` prop overrides the engine for that field (used by the async-validation
demo).

## `FormBuilder`

```tsx
<FormBuilder
  form={form}
  columns={2}
  fields={[
    { name: "name", label: "Full name", type: "text", colSpan: 2 },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "role", label: "Role", type: "select", options: roles },
    { name: "active", label: "Active", type: "switch" },
  ]}
/>
```

`FormBuildField` supports `type` (`text`/`email`/`password`/`number`/`date`/
`time`/`textarea`/`select`/`checkbox`/`switch`/`custom`), `label`,
`description`, `placeholder`, `required`, `rows` (textarea), `options` (select),
`colSpan`, `hidden(values)` for conditional fields, and `render(field, binding)`
for `type: "custom"`. Checkbox/switch render their label inline; everything else
is wrapped in a `FormField`. `columns` sets the grid width at the widest
breakpoint (the grid collapses responsively via the `--ui-form-columns` token).

`FormActions` is a footer row for submit/cancel buttons, and `Form` renders a
real `<form>` with the engine's `handleSubmit` attached.

## Accessibility

- Controls are labelled through `FormField`, never by placeholder alone.
- Validation messages are `role="alert"` and linked via `aria-describedby`.
- `required` maps to both the visual marker and the native attribute.
- Fieldset/legend grouping is available via `Fieldset` for grouped controls.

## Tests

- `tests/components/form-engine.test.tsx` — engine behaviour incl. `useField` / `useController`.
- `tests/components/forms.test.tsx` — controls, `FormField`, and validation UI.
- `tests/components/form-extras.test.tsx` — `useWatch` / `useFormState` / `useFieldArray` and the file/date/autocomplete fields.
