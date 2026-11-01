import { render, screen } from "@testing-library/react";
import { Avatar, Badge, Table, Tag } from "@adem.rejeb/ui";

describe("Badge", () => {
  it("applies the variant class and size", () => {
    render(
      <Badge variant="success" size="sm">
        Active
      </Badge>,
    );
    const badge = screen.getByText("Active");
    expect(badge).toHaveClass("ui-badge", "ui-badge--success");
    expect(badge).toHaveAttribute("data-size", "sm");
  });

  it("renders a status dot when requested", () => {
    const { container } = render(<Badge dot>Status</Badge>);
    expect(container.querySelector(".ui-badge__dot")).not.toBeNull();
  });
});

describe("Tag", () => {
  it("applies the variant class", () => {
    render(<Tag variant="primary">Design</Tag>);
    expect(screen.getByText("Design").closest(".ui-tag")).toHaveClass("ui-tag", "ui-tag--primary");
  });
});

describe("Table", () => {
  it("renders semantic structure inside a scroll wrapper", () => {
    const { container } = render(
      <Table>
        <Table.Caption>Quarterly revenue</Table.Caption>
        <Table.Header>
          <Table.Row>
            <Table.Head scope="col">Region</Table.Head>
            <Table.Head align="end">Revenue</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>EMEA</Table.Cell>
            <Table.Cell align="end">$1.2M</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    expect(container.querySelector(".ui-table-wrapper")).not.toBeNull();
    expect(screen.getByRole("table", { name: "Quarterly revenue" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Revenue" })).toHaveAttribute(
      "data-align",
      "end",
    );
    expect(screen.getByRole("cell", { name: "$1.2M" })).toHaveAttribute("data-align", "end");
  });
});

describe("Avatar", () => {
  it("renders initials fallback with an accessible name", () => {
    const { container } = render(<Avatar name="Ada Lovelace" />);
    const avatar = screen.getByRole("img", { name: "Ada Lovelace" });
    expect(avatar).toHaveClass("ui-avatar--circle");
    // Initials are drawn as CSS generated content from `data-initials` so the
    // visible glyphs never compete with the accessible name.
    expect(container.querySelector(".ui-avatar__fallback")).toHaveAttribute("data-initials", "AL");
  });

  it("renders a status dot", () => {
    const { container } = render(<Avatar name="Grace Hopper" status="success" />);
    expect(container.querySelector(".ui-avatar__status")).toHaveAttribute("data-status", "success");
  });
});
