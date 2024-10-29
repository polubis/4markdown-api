import type { ProjectId } from '../infra/models';

const isDev = (projectId: ProjectId): boolean =>
  projectId === process.env.DEV_PROJECT_ID;

export { isDev };
