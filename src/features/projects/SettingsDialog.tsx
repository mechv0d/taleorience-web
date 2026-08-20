import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { ImagePlus, X } from "lucide-react";

import { assetContentUrl } from "@/api/endpoints";
import { useUpdateProject } from "@/api/hooks";
import { Button, IconButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Popover } from "@/components/ui/Popover";
import { Spinner } from "@/components/ui/Spinner";
import { AssetGrid } from "@/features/editor/AssetGrid";
import type { Project } from "@/api/types";

interface SettingsDialogProps {
  open: boolean;
  project: Project | undefined;
  onClose: () => void;
}

/**
 * Project settings: name, description and the project banner.
 * Saving requires `PATCH /projects/:id` — TODO(backend): see backend-should-implement.md.
 */
export function SettingsDialog({ open, project, onClose }: SettingsDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [bannerAssetId, setBannerAssetId] = useState<string | null>(null);
  const updateProject = useUpdateProject();

  useEffect(() => {
    if (!open || !project) return;
    setName(project.name);
    setDescription(project.description ?? "");
    setBannerAssetId(project.bannerAssetId);
  }, [open, project]);

  if (!open || !project) return null;

  const dirty =
    name.trim() !== project.name ||
    description.trim() !== (project.description ?? "") ||
    bannerAssetId !== project.bannerAssetId;

  const save = () => {
    updateProject.mutate(
      {
        projectId: project.id,
        input: {
          name: name.trim(),
          description: description.trim() || null,
          bannerAssetId,
        },
      },
      { onSuccess: () => onClose() },
    );
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Project settings"
        className="w-full max-w-md rounded-large border border-border bg-page p-5 shadow-popover animate-popover-in"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text">Settings</h2>
          <IconButton size="icon" aria-label="Close settings" onClick={onClose}>
            <X className="h-4 w-4" />
          </IconButton>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-text-secondary">Project name</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} aria-label="Project name" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-text-secondary">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              aria-label="Project description"
              rows={2}
              className="h-auto w-full rounded-small border border-border bg-page px-2.5 py-2 text-sm text-text placeholder:text-text-muted focus:border-focus focus:outline-none"
            />
          </label>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-text-secondary">Project banner</span>
            <BannerField
              projectId={project.id}
              assetId={bannerAssetId}
              onChange={setBannerAssetId}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-2">
          {updateProject.isError && (
            <p className="text-xs text-danger" role="alert">
              Could not save settings.
            </p>
          )}
          {updateProject.isPending && <Spinner className="h-4 w-4" />}
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!name.trim() || !dirty || updateProject.isPending}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function BannerField({
  projectId,
  assetId,
  onChange,
}: {
  projectId: string;
  assetId: string | null;
  onChange: (id: string | null) => void;
}) {
  const [selected, setSelected] = useState<string[]>(assetId ? [assetId] : []);

  useEffect(() => {
    setSelected(assetId ? [assetId] : []);
  }, [assetId]);

  if (assetId) {
    return (
      <div className="relative overflow-hidden rounded-medium border border-border">
        <img src={assetContentUrl(projectId, assetId)} alt="Project banner" className="aspect-video w-full object-cover" />
        <IconButton
          size="icon"
          aria-label="Remove banner"
          className="absolute right-1.5 top-1.5 h-6 w-6 bg-page/90 shadow"
          onClick={() => onChange(null)}
        >
          <X className="h-3.5 w-3.5" />
        </IconButton>
      </div>
    );
  }

  return (
    <Popover
      label="Choose banner"
      trigger={({ toggle }) => (
        <Button variant="outline" size="sm" onClick={toggle} leadingIcon={<ImagePlus className="h-3.5 w-3.5" />}>
          Choose banner
        </Button>
      )}
    >
      {({ close }) => (
        <div className="w-72 p-3">
          <AssetGrid projectId={projectId} multi={false} selected={selected} onSelect={setSelected} />
          <div className="mt-3 flex justify-end">
            <Button
              variant="primary"
              size="sm"
              disabled={selected.length === 0}
              onClick={() => {
                onChange(selected[0] ?? null);
                close();
              }}
            >
              Set banner
            </Button>
          </div>
        </div>
      )}
    </Popover>
  );
}