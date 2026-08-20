import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { ContextMenu, type MenuItemDef } from "./ContextMenu";

const items: MenuItemDef[] = [
  { type: "item", label: "Create sub-page", icon: <span>+</span> },
  { type: "separator" },
  { type: "item", label: "Rename" },
  { type: "item", label: "Danger zone", danger: true },
  { type: "item", label: "Disabled", disabled: true },
];

describe("ContextMenu", () => {
  it("opens on right click at the cursor position", () => {
    render(
      <ContextMenu items={items}>
        <div data-testid="target">right-click me</div>
      </ContextMenu>,
    );

    const target = screen.getByTestId("target");
    fireEvent.contextMenu(target, { clientX: 120, clientY: 80 });

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByText("Create sub-page")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Rename" })).toBeInTheDocument();
  });

  it("closes after selecting an item and fires onSelect", () => {
    const onSelect = vi.fn();
    const withHandler: MenuItemDef[] = [
      { type: "item", label: "Pick me", onSelect },
    ];
    render(
      <ContextMenu items={withHandler}>
        <div data-testid="target">right-click</div>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByTestId("target"));
    fireEvent.click(screen.getByRole("menuitem", { name: "Pick me" }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("does not fire onSelect for disabled items", () => {
    const onSelect = vi.fn();
    const withDisabled: MenuItemDef[] = [{ type: "item", label: "Locked", disabled: true, onSelect }];
    render(
      <ContextMenu items={withDisabled}>
        <div data-testid="target">right-click</div>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByTestId("target"));
    const item = screen.getByRole("menuitem", { name: "Locked" });
    fireEvent.click(item);

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("closes on Escape", () => {
    render(
      <ContextMenu items={items}>
        <div data-testid="target">right-click</div>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByTestId("target"));
    fireEvent.keyDown(document.body, { key: "Escape" });

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});