import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";

import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/cn";

export type MenuItemDef =
  | { type: "separator" }
  | {
      type: "item";
      label: string;
      icon?: ReactNode;
      shortcut?: string;
      disabled?: boolean;
      danger?: boolean;
      onSelect?: () => void;
      submenu?: MenuItemDef[];
    };

const MENU_PADDING = 8;
const SUBMENU_GAP = 4;

function clampToViewport(x: number, y: number, width: number, height: number) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cx = Math.min(x, vw - width - MENU_PADDING);
  const cy = Math.min(y, vh - height - MENU_PADDING);
  return { x: Math.max(MENU_PADDING, cx), y: Math.max(MENU_PADDING, cy) };
}

interface MenuPanelProps {
  items: MenuItemDef[];
  x: number;
  y: number;
  onItemSelect: () => void;
  openSubmenu: (position: { x: number; y: number; items: MenuItemDef[] }) => void;
  onEnterSubmenu: () => void;
}

function MenuPanel({ items, x, y, onItemSelect, openSubmenu, onEnterSubmenu }: MenuPanelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const { x: nx, y: ny } = clampToViewport(x, y, rect.width, rect.height);
    node.style.left = `${nx}px`;
    node.style.top = `${ny}px`;
  }, [x, y]);

  const handleSelect = (item: MenuItemDef) => {
    if (item.type !== "item" || item.disabled) return;
    if (item.submenu) return;
    onItemSelect();
    item.onSelect?.();
  };

  return (
    <div
      ref={ref}
      role="menu"
      className="fixed z-50 min-w-56 rounded-large border border-border bg-page py-1 shadow-popover animate-popover-in"
      style={{ left: x, top: y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, index) => {
        if (item.type === "separator") {
          return <div key={index} role="separator" className="mx-2 my-1 h-px bg-border-subtle" />;
        }
        return (
          <div key={index} className="relative" onMouseEnter={onEnterSubmenu}>
            <button
              role="menuitem"
              disabled={item.disabled}
              onClick={() => handleSelect(item)}
              onMouseEnter={(event) => {
                if (item.submenu) {
                  const rect = event.currentTarget.getBoundingClientRect();
                  openSubmenu({
                    x: rect.right + SUBMENU_GAP,
                    y: rect.top - 2,
                    items: item.submenu!,
                  });
                }
              }}
              className={cn(
                "flex h-9 w-full items-center gap-2.5 px-2.5 text-left text-sm",
                "disabled:cursor-not-allowed disabled:text-text-disabled",
                item.danger ? "text-danger hover:bg-danger-soft" : "text-text hover:bg-surface-hover",
                "transition-colors",
              )}
            >
              <span className="flex w-4 shrink-0 justify-center text-icon">{item.icon}</span>
              <span className="flex-1 truncate">{item.label}</span>
              {item.shortcut && <span className="text-xs text-text-muted">{item.shortcut}</span>}
              {item.submenu && <ChevronRight className="h-3.5 w-3.5 text-icon-muted" />}
            </button>
          </div>
        );
      })}
    </div>
  );
}

interface ContextMenuState {
  x: number;
  y: number;
  items: MenuItemDef[];
}

interface ContextMenuProps {
  items: MenuItemDef[];
  children: ReactNode;
  /** Open the menu on a normal left click too (defaults to right-click only). */
  trigger?: "contextmenu" | "click";
  onOpen?: () => void;
}

/**
 * Right-click (or click) context menu with separators, submenus, danger and
 * disabled items. Rendered in a portal, clamped to the viewport.
 */
export function ContextMenu({ items, children, trigger = "contextmenu", onOpen }: ContextMenuProps) {
  const [menu, setMenu] = useState<ContextMenuState | null>(null);
  const [submenu, setSubmenu] = useState<ContextMenuState | null>(null);
  const openTimer = useRef<number | null>(null);

  const closeAll = useCallback(() => {
    setMenu(null);
    setSubmenu(null);
  }, []);

  const openAt = useCallback(
    (x: number, y: number) => {
      setMenu({ x, y, items });
      setSubmenu(null);
      onOpen?.();
    },
    [items, onOpen],
  );

  useEffect(() => {
    if (!menu) return;
    const onPointerDown = () => {
      closeAll();
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") closeAll();
    };
    const onScroll = () => closeAll();
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [menu, closeAll]);

  useEffect(() => {
    return () => {
      if (openTimer.current) window.clearTimeout(openTimer.current);
    };
  }, []);

  const handleTrigger = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    openAt(event.clientX, event.clientY);
  };

  const handleEnterSubmenu = () => {
    if (openTimer.current) window.clearTimeout(openTimer.current);
    openTimer.current = window.setTimeout(() => {
      setSubmenu(null);
    }, 250);
  };

  return (
    <>
      <span
        className="contents"
        onContextMenu={trigger === "contextmenu" ? handleTrigger : undefined}
        onClick={trigger === "click" ? handleTrigger : undefined}
      >
        {children}
      </span>
      {menu &&
        createPortal(
          <MenuPanel
            items={menu.items}
            x={menu.x}
            y={menu.y}
            onItemSelect={closeAll}
            openSubmenu={(pos) => setSubmenu(pos)}
            onEnterSubmenu={handleEnterSubmenu}
          />,
          document.body,
        )}
      {submenu &&
        createPortal(
          <MenuPanel
            items={submenu.items}
            x={submenu.x}
            y={submenu.y}
            onItemSelect={closeAll}
            openSubmenu={(pos) => setSubmenu(pos)}
            onEnterSubmenu={handleEnterSubmenu}
          />,
          document.body,
        )}
    </>
  );
}