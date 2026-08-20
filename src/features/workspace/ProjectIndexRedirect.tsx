import { Navigate, useParams } from "react-router-dom";

import { useGameObjectTree } from "@/api/hooks";
import { Spinner } from "@/components/ui/Spinner";

/** `/projects/:id` — selects the project's root object once the tree loads. */
export function ProjectIndexRedirect() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: tree, isLoading, isError } = useGameObjectTree(projectId);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isError) {
    return <Navigate to="/" replace />;
  }

  const root = tree?.[0];
  if (!root) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-text-muted">No objects in this project yet.</p>
      </div>
    );
  }

  return <Navigate to={`/projects/${projectId}/game-objects/${root.id}`} replace />;
}