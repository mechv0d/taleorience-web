import { apiUrl } from "@/api/client";
import { cn } from "@/lib/cn";
import type { Block } from "@/api/types";
import { MarkdownView } from "./MarkdownView";

/** Read-only renderer for every block type (edit mode arrives in feature/editor). */
export function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "text":
      return <TextBlock content={block.data.content} />;
    case "image":
      return <ImageBlock assetId={block.data.assetId} caption={block.data.caption} projectId={block.projectId} />;
    case "gallery":
      return <GalleryBlock assetIds={block.data.assetIds} projectId={block.projectId} />;
    case "quote":
      return <QuoteBlock content={block.data.content} attribution={block.data.attribution} />;
    case "callout":
      return <CalloutBlock content={block.data.content} emoji={block.data.emoji} />;
    case "divider":
      return <hr className="my-4 border-border" />;
    case "table":
      return <TableBlock headers={block.data.headers} rows={block.data.rows} />;
    case "embed":
      return <EmbedBlock url={block.data.url} caption={block.data.caption} />;
  }
}

function TextBlock({ content }: { content: string }) {
  return <MarkdownView content={content} />;
}

function ImageBlock({
  assetId,
  caption,
  projectId,
}: {
  assetId: string;
  caption?: string;
  projectId: string;
}) {
  return (
    <figure className="my-3">
      <img
        src={apiUrl(`/projects/${projectId}/assets/${assetId}/content`)}
        alt={caption ?? ""}
        className="max-h-[420px] w-full rounded-medium object-contain border border-border-subtle"
      />
      {caption && <figcaption className="mt-1.5 text-sm text-text-muted">{caption}</figcaption>}
    </figure>
  );
}

function GalleryBlock({ assetIds, projectId }: { assetIds: string[]; projectId: string }) {
  return (
    <div className="my-3 grid grid-cols-3 gap-2">
      {assetIds.map((id) => (
        <img
          key={id}
          src={apiUrl(`/projects/${projectId}/assets/${id}/thumbnail`)}
          alt=""
          className="aspect-square w-full rounded-medium border border-border-subtle object-cover"
        />
      ))}
    </div>
  );
}

function QuoteBlock({ content, attribution }: { content: string; attribution?: string }) {
  return (
    <blockquote
      className={cn(
        "my-3 border-l-2 border-primary pl-4",
        "font-serif text-[17px] italic leading-relaxed text-text",
      )}
    >
      {content}
      {attribution && (
        <footer className="mt-1 text-sm not-italic text-text-muted">— {attribution}</footer>
      )}
    </blockquote>
  );
}

function CalloutBlock({ content, emoji }: { content: string; emoji?: string }) {
  return (
    <div className="my-3 flex items-start gap-2.5 rounded-medium border border-callout-info-border bg-callout-info-soft px-3.5 py-2.5">
      {emoji && <span className="text-base leading-relaxed">{emoji}</span>}
      <p className="text-[15px] leading-relaxed text-text">{content}</p>
    </div>
  );
}

function TableBlock({ headers, rows }: { headers?: string[]; rows: string[][] }) {
  return (
    <div className="my-3 overflow-x-auto rounded-medium border border-border-subtle">
      <table className="w-full border-collapse text-sm">
        {headers && headers.length > 0 && (
          <thead>
            <tr className="bg-surface">
              {headers.map((h, i) => (
                <th key={i} className="border-b border-border px-3 py-2 text-left font-semibold text-text">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="odd:bg-surface">
              {row.map((cell, j) => (
                <td key={j} className="border-b border-border-subtle px-3 py-2 text-text">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmbedBlock({ url, caption }: { url: string; caption?: string }) {
  return (
    <figure className="my-3">
      <iframe
        src={url}
        title={caption ?? url}
        className="aspect-video w-full rounded-medium border border-border-subtle"
      />
      {caption && <figcaption className="mt-1.5 text-sm text-text-muted">{caption}</figcaption>}
    </figure>
  );
}