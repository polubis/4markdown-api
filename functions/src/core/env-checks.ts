import { IProjectId } from '../models/project-id';

const isProd = (projectId: IProjectId): boolean =>
  projectId === process.env.PROD_PROJECT_ID;

const isDev = (projectId: IProjectId): boolean =>
  projectId === process.env.DEV_PROJECT_ID;

export { isDev, isProd };
