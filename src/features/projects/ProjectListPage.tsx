import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import {
  BookOpenText,
  Boxes,
  LayoutGrid,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";

import { useCreateProject, useDeleteProject, useProjects } from "@/api/hooks";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";
import type { Project } from "@/api/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface ProjectCardProps {
  project: Project;
  onOpen: (id: string) => void;
  onDelete: (project: Project) => void;
}

function ProjectCard({ project, onOpen, onDelete }: ProjectCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(project.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen(project.id);
      }}
      className={cn(
        "group relative flex flex-col gap-3 rounded-large border border-border bg-surface p-4",
        "transition-all hover:border-primary hover:shadow-popover",
        "focus-visible:outline-2 focus-visible:outline-focus",
      )}
      data-testid="project-card"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-medium bg-primary-soft text-primary">
          <BookOpenText className="h-5 w-5" />
        </div>
        {project.isExample && <Badge variant="primary">Example</Badge>}
      </div>

      <div className="min-w-0">
        <h2 className="truncate text-base font-semibold text-text">{project.name}</h2>
        <p className="mt-0.5 line-clamp-2 min-h-[2.5rem] text-sm text-text-secondary">
          {project.description || "No description"}
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-text-muted">
        <span>Updated {formatDate(project.updatedAt)}</span>
        {project.isReadOnly ? (
          <Badge variant="neutral">Read-only</Badge>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${project.name}`}
            className="text-icon-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-danger"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
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

export function ProjectListPage() {
  const navigate = useNavigate();
  const { data: projects, isLoading, isError } = useProjects();
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<Project | null>(null);
  const deleteMutation = useDeleteProject();

  const openProject = (id: string) => navigate(`/projects/${id}`);

  return (
    <main className="min-h-screen bg-surface">
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