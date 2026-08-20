import { useMemo, useState, type ReactNode } from "react";

import { ArrowLeft, Search } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Popover } from "@/components/ui/Popover";
import { OBJECT_ICONS, type ObjectIconName } from "@/api/types";
import { cn } from "@/lib/cn";
import { objectIconByName } from "./objectIcons";

interface IconPickerProps {
  value: string | null | undefined;
  onSelect: (icon: ObjectIconName) => void;
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
}

/** Searchable icon palette for GameObjects (case-insensitive name filter). */
export function IconPicker({ value, onSelect, trigger }: IconPickerProps) {
  return (
    <Popover label="Choose icon" trigger={trigger}>
      {({ close }) => (
        <IconGrid
          value={value}
          onSelect={(icon) => {
            onSelect(icon);
            close();
          }}
        />
      )}
    </Popover>
  );
}

/** The icon grid itself — reusable inside menus (e.g. the object header menu). */
export function IconGrid({
  value,
  onSelect,
  onBack,
}: {
  value: string | null | undefined;
  onSelect: (icon: ObjectIconName) => void;
  onBack?: () => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return OBJECT_ICONS;
    return OBJECT_ICONS.filter((name) => name.includes(q) || name.replace("-", " ").includes(q));
  }, [query]);

  return (
    <div className="w-64 p-3">
      <div className="mb-2 flex items-center gap-1.5">
        {onBack && (
          <Button variant="ghost" size="sm" aria-label="Back" onClick={onBack} className="h-7 w-7 justify-center p-0">
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
        )}
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-icon-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find an icon…"
            aria-label="Find an icon"
            autoFocus
            className="h-7 w-full rounded-small border border-border bg-page pl-7 pr-2 text-xs text-text placeholder:text-text-muted focus:border-focus focus:outline-none"
          />
        </div>
      </div>
      <div className="grid max-h-56 grid-cols-4 gap-1 overflow-y-auto">
        {filtered.map((name) => {
          const active = value === name;
          return (
            <button
              key={name}
              title={name}
              aria-label={`Icon ${name}`}
              aria-pressed={active}
              onClick={() => onSelect(name)}
              className={cn(
                "flex aspect-square items-center justify-center rounded-small border text-icon hover:bg-surface-hover hover:text-text",
                active ? "border-primary bg-primary-soft text-primary" : "border-transparent",
              )}
            >
              {objectIconByName(name, "h-4.5 w-4.5")}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-4 py-4 text-center text-xs text-text-muted">No icons match.</p>
        )}
      </div>
    </div>
  );
}