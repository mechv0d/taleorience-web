import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { ProjectListPage } from "./features/projects/ProjectListPage";
import { WorkspaceLayout } from "./features/workspace/WorkspaceLayout";
import { ProjectIndexRedirect } from "./features/workspace/ProjectIndexRedirect";
import { ObjectView } from "./features/object/ObjectView";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5_000,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProjectListPage />} />
          <Route path="/projects/:projectId" element={<WorkspaceLayout />}>
            <Route index element={<ProjectIndexRedirect />} />
            <Route path="game-objects/:gameObjectId" element={<ObjectView />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}