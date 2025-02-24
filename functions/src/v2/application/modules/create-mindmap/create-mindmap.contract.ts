import { type MindmapModel } from '@domain/models/mindmap';
import { description, name, tags } from '@utils/validators';
import { z } from 'zod';

const createMindmapPayloadSchema = z.object({
  name: name(),
  description: description().nullable(),
  tags: tags().nullable(),
});

type CreateMindmapDto = MindmapModel & { id: string };
type CreateMindmapPayload = z.infer<typeof createMindmapPayloadSchema>;

export { createMindmapPayloadSchema };
export type { CreateMindmapDto, CreateMindmapPayload };
