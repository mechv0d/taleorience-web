import { useState } from "react";
import { useParams } from "react-router-dom";

import { Link2, Plus, Tags, Undo2 } from "lucide-react";

import {
  useAddTagToObject,
  useBacklinks,
  useGameObjectTags,
  useGameObjectTree,
  useRelations,
  useRemoveTagFromObject,
} from "@/api/hooks";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { TagChip } from "@/components/ui/TagChip";
import { findNode } from "@/lib/tree";
import { useUiStore } from "@/stores/uiStore";

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-border-subtle px-3 py-3">
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

export function RightSidebar() {
  const { projectId, gameObjectId } = useParams<{ projectId: string; gameObjectId: string }>();
  const rightSidebarOpen = useUiStore((s) => s.rightSidebarOpen);

  const { data: tags, isLoading: tagsLoading } = useGameObjectTags(projectId, gameObjectId);
  const { data: relations } = useRelations(projectId);
  const { data: backlinks } = useBacklinks(projectId, gameObjectId);
  const { data: tree } = useGameObjectTree(projectId);
  const addTag = useAddTagToObject();
  const removeTag = useRemoveTagFromObject();

  const [newTag, setNewTag] = useState("");
  const [showAddTag, setShowAddTag] = useState(false);

  if (!rightSidebarOpen) return null;

  const outgoing = relations?.filter((r) => r.sourceGameObjectId === gameObjectId) ?? [];

  return (
    <aside
      className="w-72 shrink-0 overflow-y-auto border-l border-border bg-surface"
      data-testid="right-sidebar"
    >
      <Section icon={<Tags className="h-3.5 w-3.5" />} title="Tags">
        {tagsLoading && <Spinner className="h-4 w-4" />}
        <div className="flex flex-wrap gap-1.5">
          {tags?.map((tag) => (
            <TagChip
              key={tag.id}
              label={tag.name}
              onRemove={() => {
                if (projectId && gameObjectId) {
                  removeTag.mutate({ projectId, gameObjectId, tagId: tag.id });
                }
              }}
            />
          ))}
          {tags && tags.length === 0 && (
            <p className="text-sm text-text-muted">No tags yet.</p>
          )}
        </div>
        {showAddTag ? (
          <form
            className="mt-2 flex items-center gap-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              const name = newTag.trim();
              if (!name || !projectId || !gameObjectId) return;
              addTag.mutate({ projectId, gameObjectId, name });
              setNewTag("");
              setShowAddTag(false);
            }}
          >
            <Input
              autoFocus
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Tag name"
              aria-label="New tag"
              className="h-7 text-xs"
            />
            <Button size="sm" type="submit" disabled={!newTag.trim()}>
              Add
            </Button>
          </form>
        ) : (
          <Button variant="ghost" size="sm" className="mt-1.5" onClick={() => setShowAddTag(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add tag
          </Button>
        )}
      </Section>

      <Section icon={<Link2 className="h-3.5 w-3.5" />} title="Relations">
        <ul className="space-y-1.5">
          {outgoing.map((relation) => {
            const target = findNode(tree ?? [], relation.targetGameObjectId);
            return (
              <li key={relation.id} className="flex items-center gap-2 text-sm text-text">
                <span className="min-w-0 flex-1 truncate">
                  <span className="text-text-muted">{relation.type} → </span>
                  {target?.name ?? "Unknown"}
                </span>
              </li>
            );
          })}
          {outgoing.length === 0 && <p className="text-sm text-text-muted">No relations yet.</p>}
        </ul>
      </Section>

      <Section icon={<Undo2 className="h-3.5 w-3.5" />} title="Backlinks">
        <ul className="space-y-1.5">
          {backlinks?.map((backlink) => (
            <li key={backlink.referenceId} className="flex items-center gap-2 text-sm text-text">
              <span className="min-w-0 flex-1 truncate">{backlink.pageTitle}</span>
              {backlink.label && (
                <span className="shrink-0 text-xs text-text-muted">{backlink.label}</span>
              )}
            </li>
          ))}
          {backlinks && backlinks.length === 0 && (
            <p className="text-sm text-text-muted">No backlinks yet.</p>
          )}
        </ul>
      </Section>
    </aside>
  );
}