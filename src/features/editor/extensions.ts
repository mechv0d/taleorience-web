import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";

/** Extensions shared by every editor instance (page editor + read-only view). */
export function coreEditorExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      codeBlock: false,
      dropcursor: false,
      gapcursor: false,
      link: { openOnClick: false, autolink: false },
    }),
    Markdown.configure({
      markedOptions: { breaks: true, gfm: true },
    }),
  ];
}