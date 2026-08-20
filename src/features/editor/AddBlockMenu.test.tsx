import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AddBlockMenu } from "./AddBlockMenu";
import type { BlockInput } from "@/api/types";

function renderMenu(onAdd: (input: BlockInput) => void) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <AddBlockMenu projectId="p1" onAdd={onAdd} />
    </QueryClientProvider>,
  );
}

describe("AddBlockMenu", () => {
  it("opens the type picker from the trigger", () => {
    renderMenu(() => {});
    fireEvent.click(screen.getByRole("button", { name: /add block/i }));
    expect(screen.getByTestId("add-block-menu")).toBeInTheDocument();
    expect(screen.getByTestId("add-block-text")).toBeInTheDocument();
  });

  it("emits a text block with placeholder content", () => {
    const onAdd = vi.fn();
    renderMenu(onAdd);
    fireEvent.click(screen.getByRole("button", { name: /add block/i }));
    fireEvent.click(screen.getByTestId("add-block-text"));
    expect(onAdd).toHaveBeenCalledWith({ type: "text", data: { content: " " } });
  });

  it("emits a divider block", () => {
    const onAdd = vi.fn();
    renderMenu(onAdd);
    fireEvent.click(screen.getByRole("button", { name: /add block/i }));
    fireEvent.click(screen.getByTestId("add-block-divider"));
    expect(onAdd).toHaveBeenCalledWith({ type: "divider", data: {} });
  });

  it("emits a table block with one empty row", () => {
    const onAdd = vi.fn();
    renderMenu(onAdd);
    fireEvent.click(screen.getByRole("button", { name: /add block/i }));
    fireEvent.click(screen.getByTestId("add-block-table"));
    expect(onAdd).toHaveBeenCalledWith({ type: "table", data: { rows: [["", ""]] } });
  });

  it("closes the picker after adding", () => {
    const onAdd = vi.fn();
    renderMenu(onAdd);
    fireEvent.click(screen.getByRole("button", { name: /add block/i }));
    fireEvent.click(screen.getByTestId("add-block-quote"));
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("add-block-menu")).not.toBeInTheDocument();
  });
});