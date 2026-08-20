import { useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { CloudUpload, File, Folder, FolderOpen, Images, Search } from "lucide-react";

import { useAssetFolders, useAssets, useUploadAsset } from "@/api/hooks";
import { apiUrl } from "@/api/client";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";
import type { Asset, AssetFolder } from "@/api/types";

const SOURCES = ["My Files", "Unsplash", "Pinterest"] as const;
type Source = (typeof SOURCES)[number];

function isImage(asset: Asset): boolean {
  return asset.mimeType.startsWith("image/");
}

function FolderCard({ folder, depth }: { folder: AssetFolder; depth: number }) {
  const [open, setOpen] = useState(depth === 0);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2 rounded-small px-1 py-1 text-left text-sm text-text hover:bg-surface-hover",
          open && "font-medium",
        )}
        aria-expanded={open}
      >
        <span className={cn("shrink-0", open ? "text-primary" : "text-icon")}>
          {open ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
        </span>
        <span className="min-w-0 flex-1 truncate">{folder.name}</span>
      </button>
      {open && <FolderChildren folder={folder} />}
    </div>
  );
}

function FolderChildren({ folder }: { folder: AssetFolder }) {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: folders } = useAssetFolders(projectId);
  const { data: assets } = useAssets(projectId);

  const childFolders = folders?.filter((f) => f.parentId === folder.id) ?? [];
  const childAssets = assets?.filter((a) => a.folderId === folder.id) ?? [];

  return (
    <div className="ml-4 space-y-px border-l border-border-subtle pl-2">
      {childFolders.map((child) => (
        <FolderCard key={child.id} folder={child} depth={1} />
      ))}
      {childAssets.map((asset) => (
        <AssetRow key={asset.id} asset={asset} />
      ))}
      {childFolders.length === 0 && childAssets.length === 0 && (
        <p className="py-1 text-xs text-text-muted">Empty folder</p>
      )}
    </div>
  );
}

function AssetRow({ asset }: { asset: Asset }) {
  return (
    <div className="flex items-center gap-2 rounded-small px-1 py-0.5 hover:bg-surface-hover" data-testid="asset-row">
      {isImage(asset) ? (
        <img
          src={apiUrl(`/projects/${asset.projectId}/assets/${asset.id}/thumbnail`)}
          alt={asset.path}
          className="h-5 w-5 shrink-0 rounded-sm object-cover"
        />
      ) : (
        <File className="h-4 w-4 shrink-0 text-icon-muted" />
      )}
      <span className="min-w-0 flex-1 truncate text-xs text-text">{asset.path.split("/").pop()}</span>
    </div>
  );
}

export function AssetsBrowser() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: assets, isLoading, isError } = useAssets(projectId);
  const { data: folders } = useAssetFolders(projectId);
  const uploadMutation = useUploadAsset();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [source, setSource] = useState<Source>("My Files");
  const [query, setQuery] = useState("");

  const topLevelFolders = folders?.filter((f) => f.parentId === null) ?? [];
  const topLevelAssets = assets?.filter((a) => a.folderId === null) ?? [];

  const visibleAssets = topLevelAssets.filter((a) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return a.path.toLowerCase().includes(q) || a.type.toLowerCase().includes(q);
  });

  const handleUpload = (file: File) => {
    if (!projectId) return;
    uploadMutation.mutate({ projectId, file });
  };

  if (source !== "My Files") {
    return (
      <div className="flex h-full flex-col">
        <SourceTabs source={source} onChange={setSource} />
        <EmptyState
          icon={<Images className="h-8 w-8" />}
          title={`${source} is not configured`}
          description="External asset sources require credentials and are not available in this build."
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="px-3 pb-2 pt-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-icon-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search my files"
            aria-label="Search my files"
            className="h-8 w-full rounded-small border border-border bg-page pl-8 pr-2 text-sm text-text placeholder:text-text-muted focus:border-focus focus:outline-none"
          />
        </div>
        <SourceTabs source={source} onChange={setSource} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        {isLoading && (
          <div className="flex justify-center py-8">
            <Spinner className="h-6 w-6" />
          </div>
        )}
        {isError && <p className="text-sm text-danger">Could not load assets.</p>}

        {!isLoading && topLevelFolders.length === 0 && visibleAssets.length === 0 && (
          <EmptyState
            icon={<Folder className="h-8 w-8" />}
            title="No assets yet"
            description="Upload images and files to use them in your world."
            action={
              <Button onClick={() => fileInputRef.current?.click()}>
                <CloudUpload className="h-4 w-4" />
                Upload
              </Button>
            }
          />
        )}

        <div className="space-y-px">
          {topLevelFolders.map((folder) => (
            <FolderCard key={folder.id} folder={folder} depth={0} />
          ))}
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          {visibleAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      </div>

      <div className="border-t border-border-subtle p-2">
        <Button className="w-full" onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending}>
          <CloudUpload className="h-4 w-4" />
          {uploadMutation.isPending ? "Uploading…" : "Upload"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          data-testid="upload-input"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

function SourceTabs({ source, onChange }: { source: Source; onChange: (s: Source) => void }) {
  return (
    <div className="mt-2 flex items-center gap-1">
      {SOURCES.map((item) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          className={cn(
            "rounded-medium px-2 py-1 text-xs font-medium",
            source === item
              ? "bg-surface-selected text-text"
              : "text-text-muted hover:bg-surface-hover hover:text-text",
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function AssetCard({ asset }: { asset: Asset }) {
  return (
    <div
      className="group flex aspect-square flex-col overflow-hidden rounded-large border border-border bg-surface"
      data-testid="asset-card"
    >
      {isImage(asset) ? (
        <img
          src={apiUrl(`/projects/${asset.projectId}/assets/${asset.id}/thumbnail`)}
          alt={asset.path}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-icon-muted">
          <File className="h-8 w-8" />
        </div>
      )}
      <div className="border-t border-border-subtle bg-page px-1.5 py-1">
        <p className="truncate text-[11px] text-text-secondary">{asset.path.split("/").pop()}</p>
      </div>
    </div>
  );
}