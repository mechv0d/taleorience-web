import { useEffect, useState, type ReactNode } from "react";

import {
  GalleryHorizontal,
  Image as ImageIcon,
  Info,
  Minus,
  Plus,
  Quote,
  Table as TableIcon,
  Tv,
  Type,
} from "lucide-react";

import { Button, IconButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Popover } from "@/components/ui/Popover";
import { AssetGrid } from "./AssetGrid";
import type { BlockInput } from "@/api/types";

interface AddBlockMenuProps {
  projectId: string;
  onAdd: (input: BlockInput) => void;
  align?: "start" | "end";
  /** Icon-only trigger for compact hover toolbars. */
  compact?: boolean;
}

type View = "types" | "embed" | "image" | "gallery";

const BLOCK_INPUTS: Record<"text" | "quote" | "callout" | "divider" | "table", BlockInput> = {
  text: { type: "text", data: { content: " " } },
  quote: { type: "quote", data: { content: " " } },
  callout: { type: "callout", data: { content: " " } },
  divider: { type: "divider", data: {} },
  table: { type: "table", data: { rows: [["", ""]] } },
};

type MenuItem =
  | { type: keyof typeof BLOCK_INPUTS; label: string; icon: ReactNode }
  | { type: "embed" | "image" | "gallery"; label: string; icon: ReactNode; view: View };

const BLOCK_TYPES: MenuItem[] = [
  { type: "text", label: "Text", icon: <Type className="h-4 w-4" /> },
  { type: "quote", label: "Quote", icon: <Quote className="h-4 w-4" /> },
  { type: "callout", label: "Callout", icon: <Info className="h-4 w-4" /> },
  { type: "divider", label: "Divider", icon: <Minus className="h-4 w-4" /> },
  { type: "table", label: "Table", icon: <TableIcon className="h-4 w-4" /> },
  { type: "embed", label: "Embed", icon: <Tv className="h-4 w-4" />, view: "embed" },
  { type: "image", label: "Image", icon: <ImageIcon className="h-4 w-4" />, view: "image" },
  { type: "gallery", label: "Gallery", icon: <GalleryHorizontal className="h-4 w-4" />, view: "gallery" },
];

export function AddBlockMenu({ projectId, onAdd, align = "start", compact = false }: AddBlockMenuProps) {
  return (
    <Popover
      align={align}
      label="Add block"
      trigger={({ toggle }) =>
        compact ? (
          <IconButton aria-label="Add block below" title="Add block" onClick={toggle} className="h-6 w-6">
            <Plus className="h-3.5 w-3.5" />
          </IconButton>
        ) : (
          <Button variant="secondary" size="sm" onClick={toggle} leadingIcon={<Plus className="h-4 w-4" />}>
            Add Block
          </Button>
        )
      }
    >
      {({ close }) => <AddBlockPanel projectId={projectId} onAdd={onAdd} onClose={close} />}
    </Popover>
  );
}

function AddBlockPanel({
  projectId,
  onAdd,
  onClose,
}: {
  projectId: string;
  onAdd: (input: BlockInput) => void;
  onClose: () => void;
}) {
  const [view, setView] = useState<View>("types");
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    setSelected([]);
  }, [view]);

  const reset = () => setView("types");

  const add = (input: BlockInput) => {
    onAdd(input);
    onClose();
  };

  if (view === "embed") {
    return (
      <div className="w-64 p-3">
        <p className="mb-2 text-xs font-medium text-text">Embed</p>
        <EmbedForm onAdd={(url, caption) => add({ type: "embed", data: { url, caption } })} onBack={reset} />
      </div>
    );
  }

  if (view === "image") {
    return (
      <AssetPickerPanel
        title="Image"
        projectId={projectId}
        multi={false}
        selected={selected}
        onSelect={(ids) => setSelected(ids)}
        onConfirm={(ids) => add({ type: "image", data: { assetId: ids[0] } })}
        onBack={reset}
      />
    );
  }

  if (view === "gallery") {
    return (
      <AssetPickerPanel
        title="Gallery"
        projectId={projectId}
        multi
        selected={selected}
        onSelect={(ids) => setSelected(ids)}
        onConfirm={(ids) => add({ type: "gallery", data: { assetIds: ids } })}
        onBack={reset}
      />
    );
  }

  return (
    <div className="w-56 p-1" data-testid="add-block-menu">
      <p className="px-2 py-1.5 text-xs font-medium text-text-muted">Add Block</p>
      {BLOCK_TYPES.map((item) => (
        <button
          key={item.type}
          data-testid={`add-block-${item.type}`}
          onClick={() => ("view" in item ? setView(item.view) : add(BLOCK_INPUTS[item.type]))}
          className="flex w-full items-center gap-2.5 rounded-small px-2 py-1.5 text-left text-sm text-text hover:bg-surface-hover"
        >
          <span className="text-icon">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

function EmbedForm({
  onAdd,
  onBack,
}: {
  onAdd: (url: string, caption?: string) => void;
  onBack: () => void;
}) {
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  return (
    <div className="flex flex-col gap-2">
      <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" aria-label="Embed URL" />
      <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption (optional)" aria-label="Caption" />
      <div className="flex justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" size="sm" disabled={!url.trim()} onClick={() => onAdd(url.trim(), caption.trim())}>
          Insert
        </Button>
      </div>
    </div>
  );
}

function AssetPickerPanel({
  title,
  projectId,
  multi,
  selected,
  onSelect,
  onConfirm,
  onBack,
}: {
  title: string;
  projectId: string;
  multi: boolean;
  selected: string[];
  onSelect: (ids: string[]) => void;
  onConfirm: (ids: string[]) => void;
  onBack: () => void;
}) {
  return (
    <div className="w-72 p-3">
      <p className="mb-2 text-xs font-medium text-text">{title}</p>
      <AssetGrid projectId={projectId} multi={multi} selected={selected} onSelect={onSelect} />
      <div className="mt-3 flex justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" size="sm" disabled={selected.length === 0} onClick={() => onConfirm(selected)}>
          {multi ? `Insert ${selected.length}` : "Insert"}
        </Button>
      </div>
    </div>
  );
}