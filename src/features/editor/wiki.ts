export interface WikiSegment {
  /** Raw `[[Name]]` / `[[Name|alias]]` matched token. */
  name: string;
  /** Alias if present, otherwise the raw name (used as display text). */
  label: string;
}

const WIKI_LINK_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

/** Extracts wiki-link tokens from a markdown text block. */
export function extractWikiLinks(content: string): WikiSegment[] {
  const links: WikiSegment[] = [];
  for (const match of content.matchAll(WIKI_LINK_RE)) {
    const name = match[1]?.trim();
    if (!name) continue;
    links.push({ name, label: match[2]?.trim() || name });
  }
  return links;
}

/** True when the text right before the caret ends with an unterminated `[[`. */
export function wikiSuggestAt(textBeforeCursor: string): string | null {
  const match = /\[\[([^[\]\n]*)$/.exec(textBeforeCursor);
  if (!match) return null;
  return match[1] ?? "";
}

const CHIP_CLASS = [
  "inline-flex items-center rounded-small border border-border-subtle bg-surface px-1.5",
  "py-0.5 align-baseline text-sm font-medium text-primary",
].join(" ");

/** Injects wiki-link chips into already-rendered HTML (tokens survive as plain text). */
export function renderWikiChipsInHtml(html: string): string {
  return html.replace(WIKI_LINK_RE, (_match, name: string, alias?: string) => {
    const label = (alias?.trim() || name.trim()).replace(/"/g, "&quot;");
    const dataName = name.trim().replace(/"/g, "&quot;");
    return `<span data-testid="wiki-chip" data-name="${dataName}" class="${CHIP_CLASS}">${label}</span>`;
  });
}