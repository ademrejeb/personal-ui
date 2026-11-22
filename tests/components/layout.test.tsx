import { render, screen } from "@testing-library/react";
import { Box, Heading, Stack, Text } from "@adem.rejeb/ui";

describe("Box", () => {
  it("renders a div by default", () => {
    render(<Box data-testid="box">content</Box>);
    expect(screen.getByTestId("box").tagName).toBe("DIV");
    expect(screen.getByTestId("box")).toHaveClass("ui-box");
  });

  it("supports the polymorphic `as` prop", () => {
    render(
      <Box as="section" data-testid="box" aria-label="region">
        content
      </Box>,
    );
    expect(screen.getByRole("region", { name: "region" }).tagName).toBe("SECTION");
  });

  it("maps padding tokens to CSS variables", () => {
    render(
      <Box data-testid="box" padding={4}>
        content
      </Box>,
    );
    expect(screen.getByTestId("box")).toHaveStyle({
      padding: "var(--ui-p-space-4, 1rem)",
    });
  });
});

describe("Stack", () => {
  it("applies flex direction and token gap", () => {
    render(
      <Stack data-testid="stack" direction="row" gap={2}>
        <span>a</span>
        <span>b</span>
      </Stack>,
    );
    const stack = screen.getByTestId("stack");
    expect(stack).toHaveClass("ui-stack");
    expect(stack).toHaveStyle({
      display: "flex",
      flexDirection: "row",
      gap: "var(--ui-p-space-2, 0.5rem)",
    });
  });
});

describe("Heading", () => {
  it("renders the semantic level by default", () => {
    render(<Heading level={3}>Title</Heading>);
    expect(screen.getByRole("heading", { level: 3, name: "Title" })).toHaveClass("ui-heading--lg");
  });

  it("decouples visual size from level", () => {
    render(
      <Heading level={2} size="display">
        Big
      </Heading>,
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveClass("ui-heading--display");
  });
});

describe("Text", () => {
  it("defaults to a span and supports `as`", () => {
    render(<Text as="p">Paragraph</Text>);
    const text = screen.getByText("Paragraph");
    expect(text.tagName).toBe("P");
    expect(text).toHaveClass("ui-text", "ui-text--sm");
  });
});
