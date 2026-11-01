import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SurveyRenderer, evaluateCondition, compileExpression } from "@adem.rejeb/ui";
import type { SurveySchema } from "@adem.rejeb/ui";

const schema: SurveySchema = {
  version: 1,
  id: "s1",
  title: "Test survey",
  pages: [
    {
      id: "p1",
      questions: [
        { id: "name", type: "text", title: "Name", validation: { required: true } },
        { id: "age", type: "number", title: "Age", min: 0, max: 120 },
        { id: "show", type: "boolean", title: "Show details?" },
        { id: "detail", type: "text", title: "Detail", visibleIf: { expression: "{show} == true" } },
      ],
    },
    {
      id: "p2",
      questions: [{ id: "rating", type: "rating", title: "Rating", max: 5 }],
    },
  ],
  settings: { allowBack: true, showProgressBar: true },
};

describe("expression evaluator", () => {
  it("evaluates arithmetic and comparisons safely", () => {
    const fn = compileExpression("{a} + {b} > 5 && {c} == 'x'");
    expect(fn({ answers: { a: 2, b: 4, c: "x" } })).toBe(true);
    expect(fn({ answers: { a: 1, b: 1, c: "y" } })).toBe(false);
  });
  it("does not execute arbitrary code", () => {
    expect(evaluateCondition("constructor", { answers: {} })).toBe(false);
    expect(() => evaluateCondition("process.exit()", { answers: {} })).not.toThrow();
  });
});

describe("SurveyRenderer", () => {
  it("renders, validates required, navigates pages, submits", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SurveyRenderer schema={schema} onSubmit={onSubmit} />);

    expect(screen.getByText("Test survey")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText(/required/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Name/), "Ada");
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText(/Page 2 of 2/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "2 of 5" }));
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(onSubmit).toHaveBeenCalled();
    const answers = onSubmit.mock.calls[0][0];
    expect(answers.name).toBe("Ada");
    expect(answers.rating).toBe(2);
  });

  it("toggles conditional visibility", async () => {
    const user = userEvent.setup();
    render(<SurveyRenderer schema={schema} />);
    expect(screen.queryByLabelText(/Detail/)).not.toBeInTheDocument();
    await user.click(screen.getByRole("checkbox"));
    expect(screen.getByLabelText(/Detail/)).toBeInTheDocument();
  });

  it("validates number ranges", async () => {
    const user = userEvent.setup();
    render(<SurveyRenderer schema={schema} />);
    await user.type(screen.getByLabelText(/Age/), "200");
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText(/at most 120/)).toBeInTheDocument();
  });
});
