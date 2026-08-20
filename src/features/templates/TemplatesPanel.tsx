// STATIC TEMPLATE — this panel is intentionally static UI (no backend CRUD yet).
// TODO(templates): wire template CRUD once the backend exposes a templates API.

import { useState } from "react";

import { Ellipsis, Eye, FlaskConical, House, Package, Search, Swords, User, Users } from "lucide-react";

import { IconButton } from "@/components/ui/Button";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface StaticTemplate {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const TEMPLATES: StaticTemplate[] = [
  { id: "character", name: "Character Template", icon: <User className="h-4 w-4" /> },
  { id: "location", name: "Location Template", icon: <House className="h-4 w-4" /> },
  { id: "quest", name: "Quest Template", icon: <Swords className="h-4 w-4" /> },
  { id: "item", name: "Item Template", icon: <Package className="h-4 w-4" /> },
  { id: "faction", name: "Faction Template", icon: <Users className="h-4 w-4" /> },
  { id: "spell", name: "Spell Template", icon: <FlaskConical className="h-4 w-4" /> },
];

export function TemplatesPanel() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>("character");

  const visible = TEMPLATES.filter((t) =>
    t.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="flex h-full flex-col">
      <div className="px-3 pb-2 pt-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-icon-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find by name or #tag"
            aria-label="Find by name or #tag"
            className="h-8 w-full rounded-small border border-border bg-page pl-8 pr-2 text-sm text-text placeholder:text-text-muted focus:border-focus focus:outline-none"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2">
        {visible.length === 0 && (
          <p className="px-3 py-6 text-sm text-text-muted">No templates match.</p>
        )}
        <ul className="space-y-px">
          {visible.map((template) => {
            const active = selected === template.id;
            return (
              <li key={template.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelected(template.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setSelected(template.id);
                  }}
                  className={cn(
                    "group flex h-8 w-full cursor-pointer items-center gap-2 rounded-small px-1 text-sm",
                    "hover:bg-surface-hover",
                    active ? "bg-surface-selected font-medium text-text" : "text-text",
                  )}
                >
                  <span className="shrink-0 text-icon">{template.icon}</span>
                  <span className="min-w-0 flex-1 truncate">{template.name}</span>
                  <span className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
                    <IconButton
                      size="icon"
                      aria-label={`Toggle visibility of ${template.name}`}
                      className="h-5 w-5"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </IconButton>
                    <IconButton
                      size="icon"
                      aria-label={`Options for ${template.name}`}
                      className="h-5 w-5"
                    >
                      <Ellipsis className="h-3.5 w-3.5" />
                    </IconButton>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-border-subtle p-2">
        {/* STATIC TEMPLATE — New Template is not wired to a backend yet. */}
        <Button className="w-full" variant="outline" onClick={() => void 0}>
          New Template
        </Button>
      </div>
    </div>
  );
}