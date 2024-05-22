import { z } from 'zod';

const schema = z.string();

type IProjectId = z.infer<typeof schema>;

const ProjectId = (projectId: unknown): IProjectId => schema.parse(projectId);

export { ProjectId };
export type { IProjectId };
