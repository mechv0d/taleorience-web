import { Editor } from "@tiptap/core";

import { coreEditorExtensions } from "./extensions";

let _editor: Editor | null = null;

/** Lazily-created headless editor used to render markdown to HTML in view mode. */
function getHeadlessEditor(): Editor {
  if (!_editor) {
    _editor = new Editor({ extensions: coreEditorExtensions(), content: "" });
  }
  return _editor;
}

const TRAILING_EMPTY_BLOCK_RE = /(<p>(\s|&nbsp;|<br>|<\/?br>)*<\/p>|<hr>|<div>(\s|&nbsp;)*<\/div>)\s*$/g;

/** Renders a markdown text-block `content` to HTML for read-only display. */
export function markdownToHtml(markdown: string): string {
  const editor = getHeadlessEditor();
  editor.commands.setContent(markdown, { contentType: "markdown" });
  return editor.getHTML().replace(TRAILING_EMPTY_BLOCK_RE, "");
}

/** Serializes an editor document to markdown (the persisted text-block content). */
export function htmlToMarkdown(html: string): string {
  const editor = getHeadlessEditor();
  editor.commands.setContent(html, { contentType: "html" });
  return normalizeMarkdown(editor.getMarkdown());
}

/** The markdown serializer escapes brackets; wiki-links are literal `[[Name]]`. */
export function normalizeMarkdown(markdown: string): string {
  return markdown.replace(/\\\[\\\[/g, "[[").replace(/\\\]\\\]/g, "]]").trim();
}