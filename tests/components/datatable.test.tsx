import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable, type Column } from "@adem.rejeb/ui";

interface Row {
  id: string;
  name: string;
  date: string | null;
  amount: number;
  note?: string;
}

const ROWS: Row[] = [
  { id: "a", name: "Alpha", date: "2026-02-01", amount: 2 },
  { id: "b", name: "Bravo", date: "2025-12-31", amount: 10 },
  { id: "c", name: "Charlie", date: "2026-01-15", amount: 2 },
];

function columns(): Column<Row>[] {
  return [
    { id: "name", header: "Name", accessor: (r) => r.name, sortable: true },
    { id: "date", header: "Date", accessor: (r) => r.date, sortable: true },
    { id: "amount", header: "Amount", accessor: (r) => r.amount, sortable: true },
  ];
}

function bodyRows(container: HTMLElement): string[][] {
  return Array.from(container.querySelectorAll("tbody tr")).map((tr) =>
    Array.from(tr.querySelectorAll("td")).map((td) => td.textContent ?? ""),
  );
}

function nameColumnOrder(container: HTMLElement): string[] {
  return bodyRows(container).map((cells) => cells[0]);
}

describe("DataTable sorting", () => {
  it("sorts date-only values chronologically across month and year boundaries", () => {
    const { container } = render(
      <DataTable
        data={ROWS}
        columns={columns()}
        getRowId={(r) => r.id}
        defaultSort={{ columnId: "date", direction: "asc" }}
      />,
    );
    expect(nameColumnOrder(container)).toEqual(["Bravo", "Charlie", "Alpha"]);
  });

  it("does not mutate the original data array", () => {
    const data = [...ROWS];
    render(
      <DataTable data={data} columns={columns()} defaultSort={{ columnId: "amount", direction: "desc" }} />,
    );
    expect(data.map((r) => r.id)).toEqual(["a", "b", "c"]);
  });

  it("keeps empty values last in both directions", () => {
    const data: Row[] = [
      { id: "a", name: "Alpha", date: "2026-01-01", amount: 1 },
      { id: "b", name: "Bravo", date: null, amount: 2 },
      { id: "c", name: "Charlie", date: "2025-06-01", amount: 3 },
    ];
    const asc = render(
      <DataTable
        data={data}
        columns={columns()}
        getRowId={(r) => r.id}
        defaultSort={{ columnId: "date", direction: "asc" }}
      />,
    );
    expect(nameColumnOrder(asc.container)).toEqual(["Charlie", "Alpha", "Bravo"]);
    asc.unmount();

    const desc = render(
      <DataTable
        data={data}
        columns={columns()}
        getRowId={(r) => r.id}
        defaultSort={{ columnId: "date", direction: "desc" }}
      />,
    );
    expect(nameColumnOrder(desc.container)).toEqual(["Alpha", "Charlie", "Bravo"]);
  });

  it("is stable for equal keys", () => {
    const data: Row[] = [
      { id: "a", name: "Alpha", date: "2026-01-01", amount: 5 },
      { id: "b", name: "Bravo", date: "2026-01-02", amount: 5 },
      { id: "c", name: "Charlie", date: "2026-01-03", amount: 5 },
    ];
    const { container } = render(
      <DataTable
        data={data}
        columns={columns()}
        getRowId={(r) => r.id}
        defaultSort={{ columnId: "amount", direction: "asc" }}
      />,
    );
    expect(nameColumnOrder(container)).toEqual(["Alpha", "Bravo", "Charlie"]);
  });

  it("cycles asc → desc → unsorted and reports changes", () => {
    const onSortChange = vi.fn();
    render(<DataTable data={ROWS} columns={columns()} onSortChange={onSortChange} />);
    const button = screen.getByRole("button", { name: /date/i });

    fireEvent.click(button);
    expect(onSortChange).toHaveBeenLastCalledWith({ columnId: "date", direction: "asc" });
    fireEvent.click(button);
    expect(onSortChange).toHaveBeenLastCalledWith({ columnId: "date", direction: "desc" });
    fireEvent.click(button);
    expect(onSortChange).toHaveBeenLastCalledWith(null);
  });

  it("does not reorder a controlled table until the parent updates", () => {
    const onSortChange = vi.fn();
    const { container } = render(
      <DataTable
        data={ROWS}
        columns={columns()}
        getRowId={(r) => r.id}
        sort={{ columnId: "date", direction: "desc" }}
        onSortChange={onSortChange}
      />,
    );
    expect(nameColumnOrder(container)).toEqual(["Alpha", "Charlie", "Bravo"]);
    fireEvent.click(screen.getByRole("button", { name: /date/i }));
    expect(onSortChange).toHaveBeenCalledWith(null);
    expect(nameColumnOrder(container)).toEqual(["Alpha", "Charlie", "Bravo"]);
  });
});

describe("DataTable pagination", () => {
  const many: Row[] = Array.from({ length: 5 }, (_, i) => ({
    id: `row-${i}`,
    name: `Row ${i}`,
    date: `2026-01-0${i + 1}`,
    amount: i,
  }));

  it("renders every row and no pagination when disabled", () => {
    const { container } = render(<DataTable data={many} columns={columns()} getRowId={(r) => r.id} />);
    expect(container.querySelectorAll("tbody tr")).toHaveLength(5);
    expect(screen.queryByRole("navigation", { name: "Table pagination" })).toBeNull();
  });

  it("paginates client-side", () => {
    const { container } = render(
      <DataTable data={many} columns={columns()} getRowId={(r) => r.id} pagination="client" pageSize={2} />,
    );
    expect(container.querySelectorAll("tbody tr")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Page 3" }));
    expect(nameColumnOrder(container)).toEqual(["Row 4"]);
  });

  it("renders the supplied slice without client sorting or slicing in server mode", () => {
    const { container, rerender } = render(
      <DataTable
        data={many.slice(0, 2)}
        columns={columns()}
        getRowId={(r) => r.id}
        pagination="server"
        pageSize={2}
        total={5}
      />,
    );
    expect(nameColumnOrder(container)).toEqual(["Row 0", "Row 1"]);
    // A sort request from the header must not reorder a server-owned dataset.
    rerender(
      <DataTable
        data={many.slice(0, 2)}
        columns={columns()}
        getRowId={(r) => r.id}
        pagination="server"
        pageSize={2}
        total={5}
        sort={{ columnId: "date", direction: "desc" }}
      />,
    );
    expect(nameColumnOrder(container)).toEqual(["Row 0", "Row 1"]);
    expect(screen.getByRole("button", { name: "Page 3" })).toBeInTheDocument();
  });
});

describe("DataTable filtering", () => {
  it("combines a global search with sorting", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DataTable
        data={ROWS}
        columns={columns()}
        getRowId={(r) => r.id}
        searchable
        searchPlaceholder="Find rows"
        defaultSort={{ columnId: "date", direction: "asc" }}
      />,
    );
    await user.type(screen.getByRole("searchbox", { name: "Find rows" }), "a");
    // Alpha, Bravo, Charlie all contain "a"; narrow to one that does not.
    await user.clear(screen.getByRole("searchbox", { name: "Find rows" }));
    await user.type(screen.getByRole("searchbox", { name: "Find rows" }), "charlie");
    expect(nameColumnOrder(container)).toEqual(["Charlie"]);
  });
});

describe("DataTable selection", () => {
  it("select-all only affects visible rows", () => {
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        data={ROWS}
        columns={columns()}
        getRowId={(r) => r.id}
        selectable
        pagination="client"
        pageSize={2}
        onSelectionChange={onSelectionChange}
      />,
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    const ids = onSelectionChange.mock.calls[0][0];
    expect(ids).toHaveLength(2);
  });

  it("shows an indeterminate header for a partial selection", () => {
    render(
      <DataTable
        data={ROWS}
        columns={columns()}
        getRowId={(r) => r.id}
        selectable
        defaultSelection={["a"]}
      />,
    );
    const header = screen.getByRole("checkbox", { name: "Select all rows" }) as HTMLInputElement;
    expect(header.indeterminate).toBe(true);
  });

  it("skips rows excluded by isRowSelectable", () => {
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        data={ROWS}
        columns={columns()}
        getRowId={(r) => r.id}
        selectable
        isRowSelectable={(r) => r.id !== "b"}
        onSelectionChange={onSelectionChange}
      />,
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    expect(onSelectionChange.mock.calls[0][0]).toEqual(["a", "c"]);
  });
});

describe("DataTable states", () => {
  it("renders a custom empty message", () => {
    render(<DataTable data={[]} columns={columns()} emptyMessage="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("renders loading skeletons", () => {
    const { container } = render(<DataTable data={ROWS} columns={columns()} loading />);
    expect(container.querySelectorAll(".ui-skeleton").length).toBeGreaterThan(0);
  });

  it("renders an error with a retry action", () => {
    const onRetry = vi.fn();
    render(<DataTable data={ROWS} columns={columns()} error="Failed to load" onRetry={onRetry} />);
    const retry = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retry);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
