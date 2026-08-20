import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

import {
  BookOpenText,
  Boxes,
  Ellipsis,
  LayoutGrid,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";

import { useCreateProject, useDeleteProject, useProjects, useUpdateProject } from "@/api/hooks";
import { assetContentUrl } from "@/api/endpoints";
import { Badge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ContextMenu, type MenuItemDef } from "@/components/ui/ContextMenu";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { absoluteDate, timeAgo } from "@/lib/time";
import { cn } from "@/lib/cn";
import type { Project } from "@/api/types";

interface ProjectCardProps {
  project: Project;
  onOpen: (id: string) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

function ProjectCard({ project, onOpen, onEdit, onDelete }: ProjectCardProps) {
  const menuItems: MenuItemDef[] = [
    {
      type: "item",
      label: "Rename",
      icon: <Pencil className="h-4 w-4" />,
      onSelect: () => onEdit(project),
    },
    { type: "separator" },
    {
      type: "item",
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      danger: true,
      onSelect: () => onDelete(project),
    },
  ];

  const banner = project.bannerAssetId ? (
    <img
      src={assetContentUrl(project.id, project.bannerAssetId)}
      alt=""
      className="aspect-square w-full object-cover"
    />
  ) : null;

  return (
    <ContextMenu items={menuItems}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpen(project.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onOpen(project.id);
        }}
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-large border border-border bg-surface text-left",
          "transition-all hover:border-primary hover:shadow-popover",
          "focus-visible:outline-2 focus-visible:outline-focus",
        )}
        data-testid="project-card"
      >
        {banner ?? (
          <div className="flex aspect-square w-full items-center justify-center bg-primary-soft text-primary">
            <BookOpenText className="h-10 w-10" />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-1 p-3">
          <h2 className="truncate text-sm font-semibold text-text">{project.name}</h2>
          <p className="line-clamp-2 min-h-[2rem] text-xs text-text-secondary">
            {project.description || "No description"}
          </p>

          <div className="mt-auto flex items-center justify-between gap-1 pt-2 text-xs text-text-muted">
            <span title={absoluteDate(project.updatedAt)}>Updated {timeAgo(project.updatedAt)}</span>
            {project.isExample && <Badge variant="primary">Example</Badge>}
            {project.isReadOnly ? (
              <Badge variant="neutral">Read-only</Badge>
            ) : (
              <ContextMenu items={menuItems}>
                <IconButton
                  size="icon"
                  aria-label={`Options for ${project.name}`}
                  className="h-6 w-6 text-icon-muted opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Ellipsis className="h-3.5 w-3.5" />
                </IconButton>
              </ContextMenu>
            )}
          </div>
        </div>
      </div>
    </ContextMenu>
  );
}

interface NewProjectFormProps {
  onCreated: (id: string) => void;
}

function NewProjectForm({ onCreated }: NewProjectFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createMutation = useCreateProject();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    createMutation.mutate(
      { name: trimmed, description: description.trim() || undefined },
      { onSuccess: (project) => onCreated(project.id) },
    );
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-2.5 rounded-large border border-dashed border-border bg-surface p-4"
      data-testid="new-project-form"
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-text">
        <Sparkles className="h-4 w-4 text-primary" />
        New project
      </div>
      <Input
        autoFocus
        placeholder="World name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        aria-label="Project name"
      />
      <Input
        placeholder="Short description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        aria-label="Project description"
      />
      <Button type="submit" disabled={!name.trim() || createMutation.isPending}>
        {createMutation.isPending ? <Spinner className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        Create
      </Button>
      {createMutation.isError && (
        <p className="text-xs text-danger" role="alert">
          Could not create the project. Please try again.
        </p>
      )}
    </form>
  );
}

function ProjectEditDialog({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const updateProject = useUpdateProject();

  useEffect(() => {
    if (!project) return;
    setName(project.name);
    setDescription(project.description ?? "");
  }, [project]);

  if (!project) return null;

  const save = () => {
    // TODO(backend): needs `PATCH /projects/:projectId` — see backend-should-implement.md.
    updateProject.mutate(
      {
        projectId: project.id,
        input: { name: name.trim(), description: description.trim() || null },
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
        aria-label="Edit project"
        className="w-full max-w-sm rounded-large border border-border bg-page p-5 shadow-popover animate-popover-in"
      >
        <h2 className="text-base font-semibold text-text">Edit project</h2>
        <div className="mt-4 flex flex-col gap-3">
          <Input
            autoFocus
            placeholder="World name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Project name"
          />
          <Input
            placeholder="Short description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-label="Project description"
          />
        </div>
        {updateProject.isError && (
          <p className="mt-2 text-xs text-danger" role="alert">
            Could not save the project.
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!name.trim() || updateProject.isPending}>
            {updateProject.isPending && <Spinner className="h-4 w-4" />}
            Save
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function ProjectListPage() {
  const navigate = useNavigate();
  const { data: projects, isLoading, isError } = useProjects();
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<Project | null>(null);
  const [toEdit, setToEdit] = useState<Project | null>(null);
  const deleteMutation = useDeleteProject();

  const openProject = (id: string) => navigate(`/projects/${id}`);

  return (
    <main className="min-h-screen bg-page">
      <header className="border-b border-border bg-page px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-medium bg-app-bar text-text-on-dark">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text">TaleOrience</h1>
            <p className="text-sm text-text-secondary">Worldbuilding editor</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">Projects</h2>
          <Button onClick={() => setCreating((v) => !v)}>
            <Plus className="h-4 w-4" />
            New project
          </Button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner className="h-8 w-8" />
          </div>
        )}

        {isError && (
          <EmptyState
            icon={<LayoutGrid className="h-8 w-8" />}
            title="Could not load projects"
            description="The backend API is not reachable. Make sure the TaleOrience API is running."
          />
        )}

        {projects && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {creating && <NewProjectForm onCreated={openProject} />}
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={openProject}
                onEdit={setToEdit}
                onDelete={setToDelete}
              />
            ))}
          </div>
        )}

        {projects && projects.length === 0 && !creating && (
          <EmptyState
            icon={<LayoutGrid className="h-8 w-8" />}
            title="No projects yet"
            description="Create your first world to start building."
            action={
              <Button onClick={() => setCreating(true)}>
                <Plus className="h-4 w-4" />
                New project
              </Button>
            }
          />
        )}
      </div>

      <ProjectEditDialog project={toEdit} onClose={() => setToEdit(null)} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        danger
        title={`Delete ${toDelete?.name ?? "project"}?`}
        description="This will permanently remove the project and all its pages. This action cannot be undone."
        confirmLabel="Delete"
        busy={deleteMutation.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          deleteMutation.mutate(toDelete.id, {
            onSuccess: () => setToDelete(null),
          });
        }}
      />
    </main>
  );
}