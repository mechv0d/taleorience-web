import { useCallback, useEffect, useRef, useState } from "react";

import { useEditor, EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Quote,
  Underline as UnderlineIcon,
} from "lucide-react";

import { useResolveReferences, useUpdateBlock } from "@/api/hooks";
import { IconButton } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { coreEditorExtensions } from "./extensions";
import { normalizeMarkdown } from "./markdown";
import { wikiSuggestAt } from "./wiki";
import { useSaveStore } from "./saveStore";

interface WikiSuggest {
  query: string;
  from: number;
  to: number;
  left: number;
  top: number;
}

const SAVE_DEBOUNCE_MS = 600;

function computeSuggest(editor: Editor): WikiSuggest | null {
  const { from, to } = editor.state.selection;
  const start = editor.state.doc.resolve(from).start();
  const textBefore = editor.state.doc.textBetween(start, from, "\n", "\n");
  const query = wikiSuggestAt(textBefore);
  if (query === null) return null;
  const coords = editor.view.coordsAtPos(to);
  return { query, from: to - query.length - 2, to, left: coords.left, top: coords.bottom + 6 };
}

export function TextBlockEditor({
  projectId,
  pageId,
  blockId,
  initialContent,
  autoFocus = false,
}: {
  projectId: string;
  pageId: string;
  blockId: string;
  initialContent: string;
  autoFocus?: boolean;
}) {
  const updateBlock = useUpdateBlock();
  const startSave = useSaveStore((s) => s.startSave);
  const endSave = useSaveStore((s) => s.endSave);
  const [suggest, setSuggest] = useState<WikiSuggest | null>(null);
  const [highlight, setHighlight] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingContentRef = useRef<string | null>(null);
  const editorRef = useRef<Editor | null>(null);
  const stateRef = useRef<{ suggest: WikiSuggest | null; results: { name: string }[] }>({
    suggest: null,
    results: [],
  });
  const insertRef = useRef<(name: string) => void>(() => {});

  const save = useCallback(
    (content: string) => {
      startSave();
      updateBlock.mutate(
        { projectId, pageId, blockId, data: { content } },
        { onSettled: () => endSave() },
      );
    },
    [projectId, pageId, blockId, updateBlock, startSave, endSave],
  );

  const resultsQuery = useResolveReferences(projectId, suggest?.query ?? "", Boolean(suggest?.query));
  const results = resultsQuery.data ?? [];
  stateRef.current = { suggest, results };

const insertWikiLink = useCallback(
    (name: string) => {
      const editor = editorRef.current;
      const current = stateRef.current.suggest;
      if (!editor || editor.isDestroyed || !current) return;
      editor
        .chain()
        .focus()
        .insertContentAt({ from: current.from, to: current.to }, `[[${name}]]`)
        .run();
      setSuggest(null);
    },
    [],
  );
  insertRef.current = insertWikiLink;

  const editor = useEditor({
    extensions: [
      ...coreEditorExtensions(),
      Placeholder.configure({ placeholder: "Write something…" }),
    ],
    content: "",
    onCreate: ({ editor }) => {
      editorRef.current = editor;
      editor.commands.setContent(initialContent, { contentType: "markdown" });
    },
    onUpdate: ({ editor }) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      const content = normalizeMarkdown(editor.getMarkdown());
      if (content === initialContent) return;
      pendingContentRef.current = content;
      debounceRef.current = setTimeout(() => {
        pendingContentRef.current = null;
        save(content);
      }, SAVE_DEBOUNCE_MS);
      setSuggest(computeSuggest(editor));
      setHighlight(0);
    },
    editorProps: {
      attributes: {
        class:
          "prose-editor min-h-[3rem] bg-page px-3 py-2 text-[15px] leading-[1.7] text-text outline-none",
      },
      handleKeyDown: (_view, event) => {
        const { suggest: current, results: currentResults } = stateRef.current;
        if (!current) return false;
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setHighlight((i) => i + 1);
          return true;
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          setHighlight((i) => Math.max(0, i - 1));
          return true;
        }
        if (event.key === "Escape") {
          setSuggest(null);
          return true;
        }
        if (event.key === "Enter") {
          if (!currentResults.length) return false;
          event.preventDefault();
          insertRef.current(currentResults[highlight % currentResults.length].name);
          return true;
        }
        return false;
      },
    },
    onDestroy: () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      if (pendingContentRef.current !== null) {
        const content = pendingContentRef.current;
        pendingContentRef.current = null;
        save(content);
      }
    },
  });

  editorRef.current = editor;

  useEffect(() => {
    if (autoFocus && editor) {
      editor.commands.focus("end");
    }
  }, [autoFocus, editor]);

  useEffect(() => {
    if (!suggest) return;
    if (results.length > 0) setHighlight((i) => Math.min(i, results.length - 1));
  }, [results.length, suggest]);

  if (!editor) return null;

  return (
    <div className="group/editor relative">
      <div className="flex flex-wrap items-center gap-0.5 rounded-t-small border border-b-0 border-border-subtle bg-surface px-1.5 py-1">
        <FormatButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} label="Bold" icon={<Bold className="h-3.5 w-3.5" />} />
        <FormatButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} label="Italic" icon={<Italic className="h-3.5 w-3.5" />} />
        <FormatButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} label="Underline" icon={<UnderlineIcon className="h-3.5 w-3.5" />} />
        <span className="mx-1 h-4 w-px bg-border" />
        <FormatButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} label="Heading 1" icon={<Heading1 className="h-3.5 w-3.5" />} />
        <FormatButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} label="Heading 2" icon={<Heading2 className="h-3.5 w-3.5" />} />
        <FormatButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} label="Heading 3" icon={<Heading3 className="h-3.5 w-3.5" />} />
        <FormatButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} label="Bullet list" icon={<List className="h-3.5 w-3.5" />} />
        <FormatButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} label="Numbered list" icon={<ListOrdered className="h-3.5 w-3.5" />} />
        <FormatButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} label="Quote" icon={<Quote className="h-3.5 w-3.5" />} />
        <span className="mx-1 h-4 w-px bg-border" />
        <FormatButton
          onClick={() => {
            if (editor.isActive("link")) {
              editor.chain().focus().unsetLink().run();
            } else {
              const url = window.prompt("Link URL");
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          active={editor.isActive("link")}
          label="Link"
          icon={<LinkIcon className="h-3.5 w-3.5" />}
        />
      </div>
      <EditorContent editor={editor} data-testid="text-editor" />
      <p className="px-0.5 pt-1 text-[11px] text-text-muted">Type [[ to link to another object.</p>

      {suggest && (
        <div
          data-testid="wiki-suggest"
          role="listbox"
          className="fixed z-50 max-h-64 w-72 overflow-y-auto rounded-small border border-border bg-popover py-1 shadow-lg"
          style={{ left: suggest.left, top: suggest.top }}
        >
          {suggest.query.length === 0 ? (
            <p className="px-3 py-2 text-xs text-text-muted">Type to search objects…</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-2 text-xs text-text-muted">No objects match.</p>
          ) : (
            results.map((result, i) => (
              <button
                key={result.id}
                role="option"
                aria-selected={i === highlight % results.length}
                onClick={() => insertWikiLink(result.name)}
                onMouseEnter={() => setHighlight(i)}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-text",
                  i === highlight % results.length && "bg-surface-hover",
                )}
              >
                <span className="truncate">{result.name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function FormatButton({
  onClick,
  active,
  label,
  icon,
}: {
  onClick: () => void;
  active: boolean;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <IconButton
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn("h-6 w-6 rounded-small", active && "bg-app-bar-active text-text-on-dark")}
    >
      {icon}
    </IconButton>
  );
}