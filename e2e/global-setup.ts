import { request } from "@playwright/test";
import type { APIRequestContext } from "@playwright/test";

const API = "http://localhost:4000";
const PROJECTS_PATH = "/api/v1/projects";
const PROJECT_NAME = "Questing in Selenia";
const CHILD_NAME = "Moonlight Citadel";

interface Project {
  id: string;
  name: string;
}

interface GameObject {
  id: string;
  name: string;
  parentId: string | null;
  children?: GameObject[];
}

async function readTree(api: APIRequestContext, projectId: string): Promise<GameObject[]> {
  const res = await api.get(`${PROJECTS_PATH}/${projectId}/game-objects/tree`);
  if (!res.ok()) {
    throw new Error(`Failed to read the project tree in global setup: ${res.status()}`);
  }
  return (await res.json()) as GameObject[];
}

/**
 * Seeds the fixture the e2e suite relies on:
 *  - a project "Questing in Selenia" (backend auto-creates a root GameObject
 *    and a Main page on project creation);
 *  - one child object "Moonlight Citadel" under the root.
 * Idempotent — existing fixtures are reused.
 */
export default async function globalSetup(): Promise<void> {
  const api = await request.newContext({ baseURL: API });

  const existing = await api.get(PROJECTS_PATH);
  if (!existing.ok()) {
    throw new Error(`Failed to list projects in global setup: ${existing.status()}`);
  }
  const projects = (await existing.json()) as Project[];
  const project = projects.find((p) => p.name === PROJECT_NAME);

  let projectId: string;
  if (!project) {
    const created = await api.post(PROJECTS_PATH, { data: { name: PROJECT_NAME } });
    if (!created.ok()) {
      throw new Error(`Failed to seed project "${PROJECT_NAME}": ${created.status()}`);
    }
    projectId = ((await created.json()) as Project).id;
  } else {
    projectId = project.id;
  }

  // The backend creates no objects on project creation, so seed a root
  // GameObject (auto-creates its "Main" page) and one child under it so the
  // tree and navigation tests can assert against a known hierarchy.
  let tree = await readTree(api, projectId);
  let root = tree[0];

  if (!root) {
    const created = await api.post(`${PROJECTS_PATH}/${projectId}/game-objects`, {
      data: { name: PROJECT_NAME, parentId: null },
    });
    if (!created.ok()) {
      throw new Error(`Failed to seed root object "${PROJECT_NAME}": ${created.status()}`);
    }
    tree = await readTree(api, projectId);
    root = tree[0];
  }

  if (root && !root.children?.some((child) => child.name === CHILD_NAME)) {
    const created = await api.post(`${PROJECTS_PATH}/${projectId}/game-objects`, {
      data: { name: CHILD_NAME, parentId: root.id },
    });
    if (!created.ok()) {
      throw new Error(`Failed to seed child object "${CHILD_NAME}": ${created.status()}`);
    }
  }

  await api.dispose();
}