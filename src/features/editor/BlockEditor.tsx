import { useCallback, useRef, useState } from "react";

import { Plus, Trash2 } from "lucide-react";

import { useUpdateBlock } from "@/api/hooks";
import { IconButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import type { Block } from "@/api/types";
import { AssetGrid } from "./AssetGrid";
import { useSaveStore } from "./saveStore";

const SAVE_DEBOUNCE_MS = 600;

function useBlockSave(projectId: string, block: Block) {
  const updateBlock = useUpdateBlock();
  const startSave = useSaveStore((s) => s.startSave);
  const endSave = useSaveStore((s) => s.endSave);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleSave = useCallback(
    (data: Block["data"]) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        startSave();
        updateBlock.mutate(
          { projectId, blockId: block.id, data, pageId: block.pageId },
          { onSettled: () => endSave() },
        );
      }, SAVE_DEBOUNCE_MS);
    },
    [projectId, block.id, block.pageId, updateBlock, startSave, endSave],
  );

  return scheduleSave;
}

const textareaClass = cn(
  "w-full rounded-small border border-border-subtle bg-page px-3 py-2 text-[15px] leading-[1.7] text-text",
  "placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-focus/30",
);

/** Editable surface for non-text blocks (text blocks use Tiptap). */
export function BlockEditor({ projectId, block }: { projectId: string; block: Block }) {
  switch (block.type) {
    case "text":
      return null;
    case "quote":
      return <QuoteEditor projectId={projectId} block={block} />;
    case "callout":
      return <CalloutEditor projectId={projectId} block={block} />;
    case "embed":
      return <EmbedEditor projectId={projectId} block={block} />;
    case "table":
      return <TableEditor projectId={projectId} block={block} />;
    case "image":
      return <ImageEditor projectId={projectId} block={block} />;
    case "gallery":
      return <GalleryEditor projectId={projectId} block={block} />;
    case "divider":
      return (
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span className="h-px flex-1 bg-border" />
          Divider
          <span className="h-px flex-1 bg-border" />
        </div>
      );
  }
}

type QuoteBlockEditorProps = { projectId: string; block: Block & { type: "quote" } };
type CalloutBlockEditorProps = { projectId: string; block: Block & { type: "callout" } };
type EmbedBlockEditorProps = { projectId: string; block: Block & { type: "embed" } };
type TableBlockEditorProps = { projectId: string; block: Block & { type: "table" } };
type ImageBlockEditorProps = { projectId: string; block: Block & { type: "image" } };
type GalleryBlockEditorProps = { projectId: string; block: Block & { type: "gallery" } };

function QuoteEditor({ projectId, block }: QuoteBlockEditorProps) {
  const save = useBlockSave(projectId, block);
  const [content, setContent] = useState(block.data.content);
  const [attribution, setAttribution] = useState(block.data.attribution ?? "");
  return (
    <div className="flex flex-col gap-2 rounded-small border border-border-subtle p-3">
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          save({ content: e.target.value, attribution: attribution || undefined });
        }}
        rows={2}
        placeholder="Quote text"
        data-testid="quote-content"
        className={cn(textareaClass, "border-l-2 border-l-primary font-serif italic")}
      />
      <Input
        value={attribution}
        onChange={(e) => {
          setAttribution(e.target.value);
          save({ content, attribution: e.target.value || undefined });
        }}
        placeholder="Attribution (optional)"
        aria-label="Attribution"
      />
    </div>
  );
}

function CalloutEditor({ projectId, block }: CalloutBlockEditorProps) {
  const save = useBlockSave(projectId, block);
  const [emoji, setEmoji] = useState(block.data.emoji ?? "");
  const [content, setContent] = useState(block.data.content);
  return (
    <div className="flex items-start gap-2 rounded-small border border-border-subtle p-3">
      <Input
        value={emoji}
        onChange={(e) => {
          setEmoji(e.target.value);
          save({ content, emoji: e.target.value || undefined });
        }}
        placeholder="🔎"
        aria-label="Emoji"
        className="w-12"
      />
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          save({ content: e.target.value, emoji: emoji || undefined });
        }}
        rows={2}
        placeholder="Callout text"
        data-testid="callout-content"
        className={textareaClass}
      />
    </div>
  );
}

function EmbedEditor({ projectId, block }: EmbedBlockEditorProps) {
  const save = useBlockSave(projectId, block);
  const [url, setUrl] = useState(block.data.url);
  const [caption, setCaption] = useState(block.data.caption ?? "");
  return (
    <div className="flex flex-col gap-2 rounded-small border border-border-subtle p-3">
      <Input
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          save({ url: e.target.value, caption: caption || undefined });
        }}
        placeholder="https://…"
        aria-label="Embed URL"
      />
      <Input
        value={caption}
        onChange={(e) => {
          setCaption(e.target.value);
          save({ url, caption: e.target.value || undefined });
        }}
        placeholder="Caption (optional)"
        aria-label="Caption"
      />
    </div>
  );
}

function TableEditor({ projectId, block }: TableBlockEditorProps) {
  const save = useBlockSave(projectId, block);
  const [rows, setRows] = useState<string[][]>(block.data.rows);

  const updateCell = (row: number, col: number, value: string) => {
    const next = rows.map((r, i) => (i === row ? r.map((c, j) => (j === col ? value : c)) : r));
    setRows(next);
    save({ headers: block.data.headers, rows: next });
  };

  const addRow = () => {
    const next = [...rows, Array(rows[0]?.length ?? 2).fill("")];
    setRows(next);
    save({ headers: block.data.headers, rows: next });
  };

  const removeRow = (row: number) => {
    const next = rows.filter((_, i) => i !== row);
    setRows(next);
    save({ headers: block.data.headers, rows: next });
  };

  return (
    <div className="rounded-small border border-border-subtle p-3">
      <table className="w-full border-collapse" data-testid="table-editor">
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="border border-border-subtle p-0.5">
                  <input
                    value={cell}
                    onChange={(e) => updateCell(i, j, e.target.value)}
                    aria-label={`Row ${i + 1}, column ${j + 1}`}
                    className="h-7 w-full bg-transparent px-2 text-sm text-text outline-none focus:bg-surface-hover"
                  />
                </td>
              ))}
              <td className="w-8 pl-1 align-middle">
                <IconButton
                  aria-label="Remove row"
                  onClick={() => removeRow(i)}
                  className="h-6 w-6"
                  title="Remove row"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={addRow}
        data-testid="table-add-row"
        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        <Plus className="h-3.5 w-3.5" /> Add row
      </button>
    </div>
  );
}

function ImageEditor({ projectId, block }: ImageBlockEditorProps) {
  const save = useBlockSave(projectId, block);
  const [selected, setSelected] = useState<string[]>(block.data.assetId ? [block.data.assetId] : []);
  const [caption, setCaption] = useState(block.data.caption ?? "");
  const [picking, setPicking] = useState(false);

  return (
    <div className="flex flex-col gap-2 rounded-small border border-border-subtle p-3">
      {picking ? (
        <AssetGrid
          projectId={projectId}
          multi={false}
          selected={selected}
          onSelect={(ids) => {
            setSelected(ids);
            if (ids[0]) save({ assetId: ids[0], caption: caption || undefined });
          }}
        />
      ) : (
        <div className="flex items-center gap-2 text-xs text-text-muted">
          {selected[0] ? <span className="text-primary">Image selected</span> : <span>No image picked.</span>}
          <button onClick={() => setPicking(true)} className="font-medium text-primary hover:underline">
            {selected[0] ? "Change" : "Pick image"}
          </button>
        </div>
      )}
      <Input
        value={caption}
        onChange={(e) => {
          setCaption(e.target.value);
          if (selected[0]) save({ assetId: selected[0], caption: e.target.value || undefined });
        }}
        placeholder="Caption (optional)"
        aria-label="Caption"
      />
    </div>
  );
}

function GalleryEditor({ projectId, block }: GalleryBlockEditorProps) {
  const save = useBlockSave(projectId, block);
  const [selected, setSelected] = useState<string[]>(block.data.assetIds);
  const [picking, setPicking] = useState(false);

  return (
    <div className="flex flex-col gap-2 rounded-small border border-border-subtle p-3">
      {picking ? (
        <AssetGrid
          projectId={projectId}
          multi
          selected={selected}
          onSelect={(ids) => {
            setSelected(ids);
            save({ assetIds: ids });
          }}
        />
      ) : (
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>{selected.length} image{selected.length === 1 ? "" : "s"} selected.</span>
          <button onClick={() => setPicking(true)} className="font-medium text-primary hover:underline">
            Edit images
          </button>
        </div>
      )}
    </div>
  );
}