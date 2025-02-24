import { type MindmapModel } from '@domain/models/mindmap';
import { mindmapEdges, mindmapNodes } from '@utils/mindmap-schemas';
import { description, name, tags } from '@utils/validators';
import { z } from 'zod';

const createMindmapPayloadSchema = () =>
  z.object({
    name: name(),
    description: description().nullable(),
    tags: tags().nullable(),
    nodes: mindmapNodes(),
    edges: mindmapEdges(),
  });

type CreateMindmapDto = MindmapModel & { id: string };
type CreateMindmapPayload = z.infer<
  ReturnType<typeof createMindmapPayloadSchema>
>;

export { createMindmapPayloadSchema };
export type { CreateMindmapDto, CreateMindmapPayload };
