import { z } from 'zod';

const schema = z.string();

type IProjectId = z.infer<typeof schema>;

const ProjectId = (projectId: unknown): IProjectId => schema.parse(projectId);

const isProd = (projectId: IProjectId): boolean =>
  projectId === process.env.PROD_PROJECT_ID;

const isDev = (projectId: IProjectId): boolean =>
  projectId === process.env.DEV_PROJECT_ID;

export type { IProjectId };
export { isDev, isProd, ProjectId };
