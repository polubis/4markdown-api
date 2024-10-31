import type { ProjectId } from '../infra/models/atoms';

const isProd = (projectId: ProjectId): boolean =>
  projectId === process.env.PROD_PROJECT_ID;

export { isProd };
