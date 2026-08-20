import { request } from "@playwright/test";

const API = "http://localhost:4000";
const PROJECTS_PATH = "/api/v1/projects";
const PROJECT_NAME = "Questing in Selenia";

interface Project {
  id: string;
  name: string;
}

/**
 * Ensures the seeded project exists against the real backend.
 * The backend auto-creates a root GameObject and a Main page when a project
 * is created, which the navigation/search tests rely on.
 */
export default async function globalSetup(): Promise<void> {
  const api = await request.newContext({ baseURL: API });

  const existing = await api.get(PROJECTS_PATH);
  if (!existing.ok()) {
    throw new Error(`Failed to list projects in global setup: ${existing.status()}`);
  }
  const projects = (await existing.json()) as Project[];
  const project = projects.find((p) => p.name === PROJECT_NAME);

  if (!project) {
    const created = await api.post(PROJECTS_PATH, { data: { name: PROJECT_NAME } });
    if (!created.ok()) {
      throw new Error(`Failed to seed project "${PROJECT_NAME}": ${created.status()}`);
    }
  }

  await api.dispose();
}