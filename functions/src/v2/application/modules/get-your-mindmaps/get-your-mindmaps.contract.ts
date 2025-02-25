import { MindmapMetaModel, MindmapModel } from '@domain/models/mindmap';
import { Id } from '@utils/validators';
import { z } from 'zod';

const getYourMindmapsPayloadSchema = z.null();

type GetYourMindmapsDto = {
  mindmaps: (MindmapModel & { id: Id })[];
} & MindmapMetaModel;

type GetYourMindmapsPayload = z.infer<typeof getYourMindmapsPayloadSchema>;

export type { GetYourMindmapsDto, GetYourMindmapsPayload };
export { getYourMindmapsPayloadSchema };
