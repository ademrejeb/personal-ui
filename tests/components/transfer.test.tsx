import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Transfer, type TransferItem } from "@personal-ui/ui";

const ITEMS: TransferItem[] = [
  { key: "a", label: "Alpha", description: "First" },
  { key: "b", label: "Beta" },
  { key: "c", label: "Gamma" },
  { key: "d", label: "Delta", disabled: true },
];

function Example(props: Partial<React.ComponentProps<typeof Transfer>> = {}) {
  return <Transfer dataSource={ITEMS} label="Columns" {...props} />;
}

describe("Transfer", () => {
  it("splits the data source into source and target panels", () => {
    render(<Example defaultTargetKeys={["c"]} />);

    expect(screen.getByText("3 items")).toBeInTheDocument();
    expect(screen.getByText("1 item")).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Gamma")).toBeInTheDocument();
    expect(screen.getByText("First")).toBeInTheDocument();
  });

  it("moves the checked items to the target side", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Example onChange={onChange} />);

    const moveRight = screen.getByRole("button", { name: "Move selected to target" });
    expect(moveRight).toBeDisabled();

    await user.click(screen.getByRole("checkbox", { name: "Beta" }));
    expect(moveRight).toBeEnabled();
    await user.click(moveRight);

    expect(onChange).toHaveBeenCalledWith(["b"], "right", ["b"]);
    expect(screen.getByText("3 items")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Beta" })).not.toBeChecked();
  });

  it("selects everything movable per side and skips disabled rows", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Example onChange={onChange} />);

    await user.click(screen.getByRole("checkbox", { name: "Select all source items" }));
    expect(screen.getByRole("checkbox", { name: "Alpha" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Delta" })).not.toBeChecked();

    await user.click(screen.getByRole("button", { name: "Move selected to target" }));
    expect(onChange).toHaveBeenCalledWith(["a", "b", "c"], "right", ["a", "b", "c"]);
  });

  it("moves items back and hides the return control in one-way mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { unmount } = render(<Example defaultTargetKeys={["a"]} onChange={onChange} />);

    await user.click(screen.getByRole("checkbox", { name: "Alpha" }));
    await user.click(screen.getByRole("button", { name: "Move selected to source" }));
    expect(onChange).toHaveBeenCalledWith([], "left", ["a"]);
    unmount();

    render(<Example oneWay />);
    expect(screen.queryByRole("button", { name: "Move selected to source" })).toBeNull();
  });

  it("works as a controlled component", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [keys, setKeys] = useState<string[]>(["a"]);
      return (
        <Transfer
          dataSource={ITEMS}
          label="Columns"
          targetKeys={keys}
          onChange={(next) => setKeys(next)}
        />
      );
    }
    render(<Controlled />);

    await user.click(screen.getByRole("checkbox", { name: "Beta" }));
    await user.click(screen.getByRole("button", { name: "Move selected to target" }));
    expect(screen.getByRole("checkbox", { name: "Beta" })).not.toBeChecked();
    expect(screen.getAllByText("2 items")).toHaveLength(2);
  });

  it("filters each side independently", async () => {
    const user = userEvent.setup();
    render(<Example showSearch />);

    await user.type(screen.getByRole("textbox", { name: "Search source list" }), "gamma");
    expect(screen.getByText("Gamma")).toBeInTheDocument();
    expect(screen.queryByText("Alpha")).toBeNull();
  });

  it("honours unstyled and per-slot classNames", () => {
    const { container } = render(
      <Example unstyled classNames={{ panel: "custom-panel" }} defaultTargetKeys={["a"]} />,
    );
    expect(container.querySelector(".ui-transfer")).toBeNull();
    expect(container.querySelectorAll(".custom-panel")).toHaveLength(2);
  });
});
