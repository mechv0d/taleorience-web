import { request } from "@playwright/test";

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

  // Ensure the project has a child object so tree navigation can be tested.
  const treeRes = await api.get(`${PROJECTS_PATH}/${projectId}/game-objects/tree`);
  if (!treeRes.ok()) {
    throw new Error(`Failed to read the project tree in global setup: ${treeRes.status()}`);
  }
  const tree = (await treeRes.json()) as GameObject[];
  const root = tree[0];
  const hasChild = root?.children?.some((child) => child.name === CHILD_NAME);

  if (root && !hasChild) {
    const created = await api.post(`${PROJECTS_PATH}/${projectId}/game-objects`, {
      data: { name: CHILD_NAME, parentId: root.id },
    });
    if (!created.ok()) {
      throw new Error(`Failed to seed child object "${CHILD_NAME}": ${created.status()}`);
    }
  }

  await api.dispose();
}