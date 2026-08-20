import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { TagChip } from "./TagChip";

describe("TagChip", () => {
  it("renders the label", () => {
    render(<TagChip label="architecture" />);
    expect(screen.getByText("architecture")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("calls onRemove when the × button is clicked", () => {
    const onRemove = vi.fn();
    render(<TagChip label="lore" onRemove={onRemove} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove tag lore" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});