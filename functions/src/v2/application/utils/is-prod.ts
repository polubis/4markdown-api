import type { ProjectId } from '../infra/models';

const isProd = (projectId: ProjectId): boolean =>
  projectId === process.env.PROD_PROJECT_ID;

export { isProd };
