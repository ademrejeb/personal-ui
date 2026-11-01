import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderHook, act } from "@testing-library/react";
import {
  Checkbox,
  Form,
  FormBuilder,
  FormField,
  Input,
  useController,
  useField,
  useForm,
} from "@personal-ui/ui";

function Demo({ onSubmit }: { onSubmit: (values: { email: string }) => void }) {
  const form = useForm({
    initialValues: { email: "" },
    validate: (values) => (values.email.trim() ? {} : { email: "Email is required" }),
    onSubmit,
  });
  return (
    <Form form={form} aria-label="signup">
      <FormField name="email" label="Email">
        <Input type="email" {...form.bind("email")} />
      </FormField>
      <button type="submit">Submit</button>
    </Form>
  );
}

describe("useForm", () => {
  it("tracks values, touched, and errors", async () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: "" },
        validate: (values) => (values.name ? {} : { name: "Required" }),
      }),
    );

    expect(result.current.values.name).toBe("");
    act(() => result.current.setValue("name", "Ada"));
    expect(result.current.values.name).toBe("Ada");

    await act(async () => {
      const error = await result.current.validateField("name");
      expect(error).toBeUndefined();
    });
    expect(result.current.errors.name).toBeUndefined();
  });

  it("validates on submit and blocks onSubmit when invalid", async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useForm({
        initialValues: { name: "" },
        validate: (values) => (values.name ? {} : { name: "Required" }),
        onSubmit,
      }),
    );

    await act(async () => {
      await result.current.submit();
    });
    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.errors.name).toBe("Required");
    expect(result.current.submitCount).toBe(1);

    act(() => result.current.setValue("name", "Ada"));
    await act(async () => {
      await result.current.submit();
    });
    expect(onSubmit).toHaveBeenCalledWith({ name: "Ada" });
  });

  it("resets back to initial values", () => {
    const { result } = renderHook(() => useForm({ initialValues: { name: "Ada" } }));
    act(() => result.current.setValue("name", "Grace"));
    act(() => result.current.reset());
    expect(result.current.values.name).toBe("Ada");
    expect(result.current.errors).toEqual({});
  });
});

describe("useField + useController", () => {
  it("exposes a field's value, error, and bindings", async () => {
    const { result } = renderHook(() => {
      const form = useForm({
        initialValues: { name: "" },
        validate: (values) => (values.name ? {} : { name: "Required" }),
      });
      return { form, field: useField(form, "name") };
    });

    expect(result.current.field.value).toBe("");
    expect(result.current.field.bind.name).toBe("name");

    act(() => result.current.field.setValue("Ada"));
    expect(result.current.field.value).toBe("Ada");

    await act(async () => {
      await result.current.form.validateField("name");
    });
    expect(result.current.field.invalid).toBe(false);

    act(() => result.current.field.setError("Nope"));
    expect(result.current.field.error).toBe("Nope");
    expect(result.current.field.invalid).toBe(true);
  });

  it("wires a controlled field through useController", () => {
    const { result } = renderHook(() =>
      useController(useForm({ initialValues: { age: 0 } }), "age", {
        transform: (input) => Number(input),
        validate: (value) => (value >= 18 ? undefined : "Must be 18+"),
      }),
    );

    expect(result.current.fieldState.isDirty).toBe(false);

    act(() => result.current.field.onChange("21"));
    expect(result.current.field.value).toBe(21);
    expect(result.current.fieldState.isDirty).toBe(true);
    expect(result.current.fieldState.error).toBeUndefined();

    act(() => result.current.field.onChange("12"));
    expect(result.current.fieldState.error).toBe("Must be 18+");

    act(() => result.current.field.onBlur());
    expect(result.current.fieldState.touched).toBe(true);
  });
});

describe("Form + FormField integration", () => {
  it("renders the external error on the field after a failed submit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Demo onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveAttribute("aria-invalid", "true");

    await user.type(screen.getByRole("textbox", { name: "Email" }), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ email: "ada@example.com" }));
  });

  it("builds controls from a schema with FormBuilder", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    function BuildDemo() {
      const form = useForm({
        initialValues: { role: "eng", active: false },
        onSubmit: (values) => onSubmit(values),
      });
      return (
        <Form form={form}>
          <FormBuilder
            form={form}
            fields={[
              {
                name: "role",
                label: "Role",
                type: "select",
                options: [
                  { label: "Engineering", value: "eng" },
                  { label: "Design", value: "design" },
                ],
              },
              { name: "active", label: "Active", type: "switch" },
            ]}
          />
          <button type="submit">Save</button>
        </Form>
      );
    }
    render(<BuildDemo />);

    await user.selectOptions(screen.getByRole("combobox", { name: "Role" }), "design");
    await user.click(screen.getByRole("switch", { name: /Active|active/ }));
    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ role: "design", active: true }));
  });

  it("binds checkboxes through bindCheckbox", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    function CheckDemo() {
      const form = useForm({
        initialValues: { terms: false },
        onSubmit: (values) => onSubmit(values),
      });
      return (
        <Form form={form}>
          <FormField name="terms" label="Terms">
            <Checkbox {...form.bindCheckbox("terms")} label="I agree" />
          </FormField>
          <button type="submit">Submit</button>
        </Form>
      );
    }
    render(<CheckDemo />);

    await user.click(screen.getByRole("checkbox", { name: "I agree" }));
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ terms: true }));
  });
});
