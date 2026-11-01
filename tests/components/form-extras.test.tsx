import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Autocomplete,
  DateTimePicker,
  FileUpload,
  useFieldArray,
  useForm,
  useFormState,
  useWatch,
  type SelectOption,
} from "@adem.rejeb/ui";

const FRUITS: SelectOption<string>[] = [
  { value: "apple", label: "Apple" },
  { value: "apricot", label: "Apricot" },
  { value: "banana", label: "Banana" },
];

describe("Autocomplete", () => {
  it("filters suggestions and commits a pick", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Autocomplete options={FRUITS} onChange={onChange} label="Fruit" />,
    );

    const input = screen.getByRole("combobox", { name: "Fruit" });
    await user.type(input, "ap");

    const options = await screen.findAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual(["Apple", "Apricot"]);

    await user.click(screen.getByRole("option", { name: "Apricot" }));
    expect(onChange).toHaveBeenLastCalledWith("Apricot");
  });

  it("allows free text that is not an option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Autocomplete options={FRUITS} onChange={onChange} label="Fruit" />);

    await user.type(screen.getByRole("combobox", { name: "Fruit" }), "cherry");
    expect(onChange).toHaveBeenLastCalledWith("cherry");
  });
});

describe("FileUpload", () => {
  it("lists selected files and removes them", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<FileUpload multiple onChange={onChange} />);

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["hello"], "notes.txt", { type: "text/plain" });
    await user.upload(input, file);

    expect(onChange).toHaveBeenCalled();
    expect(screen.getByText("notes.txt")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /remove notes\.txt/i }));
    expect(screen.queryByText("notes.txt")).not.toBeInTheDocument();
  });

  it("rejects files over maxSize", async () => {
    const user = userEvent.setup();
    const { container } = render(<FileUpload maxSize={2} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, new File(["too big"], "big.txt"));
    expect(await screen.findByRole("status")).toHaveTextContent(/exceeds/i);
  });
});

describe("DateTimePicker", () => {
  it("opens the combined date and time popup", async () => {
    const user = userEvent.setup();
    render(<DateTimePicker label="Starts at" />);
    const trigger = screen.getByRole("combobox", { name: "Starts at" });
    await user.click(trigger);
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    expect(screen.getByRole("listbox", { name: "Hour" })).toBeInTheDocument();
    expect(screen.getByRole("listbox", { name: "Minute" })).toBeInTheDocument();
  });
});

function Nested() {
  const form = useForm({ initialValues: { title: "", tags: [""] } });
  const watched = useWatch(form, "title");
  const state = useFormState(form);
  const array = useFieldArray<typeof form.values, "tags", string>(form, "tags");
  return (
    <div>
      <span data-testid="watch">{watched}</span>
      <span data-testid="dirty">{String(state.isDirty)}</span>
      <button onClick={() => array.append("new")}>Add</button>
      <button onClick={() => array.remove(0)}>Remove first</button>
      <span data-testid="count">{array.fields.length}</span>
      <button onClick={() => form.setValue("title", "Hello")}>Rename</button>
    </div>
  );
}

describe("form hooks", () => {
  it("watches values, reports dirty state, and mutates arrays", async () => {
    const user = userEvent.setup();
    render(<Nested />);

    expect(screen.getByTestId("watch")).toHaveTextContent("");
    expect(screen.getByTestId("dirty")).toHaveTextContent("false");

    await user.click(screen.getByRole("button", { name: "Rename" }));
    expect(screen.getByTestId("watch")).toHaveTextContent("Hello");
    expect(screen.getByTestId("dirty")).toHaveTextContent("true");

    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByTestId("count")).toHaveTextContent("2");

    await user.click(screen.getByRole("button", { name: "Remove first" }));
    expect(screen.getByTestId("count")).toHaveTextContent("1");
  });
});
