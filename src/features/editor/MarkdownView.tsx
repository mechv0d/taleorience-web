import { useMemo } from "react";

import { markdownToHtml } from "./markdown";
import { renderWikiChipsInHtml } from "./wiki";

/** Read-only markdown rendering with `[[Name]]` wiki-link chips. */
export function MarkdownView({ content }: { content: string }) {
  const html = useMemo(() => renderWikiChipsInHtml(markdownToHtml(content)), [content]);
  if (!content.trim()) return null;
  return (
    <div
      className="prose-view text-[16px] leading-[1.7] text-text"
      data-testid="markdown-view"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}