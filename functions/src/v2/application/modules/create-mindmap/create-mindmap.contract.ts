import { type MindmapModel } from '@domain/models/mindmap';
import {
  mindmapEdges,
  mindmapNodes,
  mindmapOrientation,
} from '@utils/mindmap-schemas';
import { description, type Id, name, tags } from '@utils/validators';
import { z } from 'zod';

const createMindmapPayloadSchema = () =>
  z.object({
    name: name(),
    description: description().nullable(),
    tags: tags().nullable(),
    nodes: mindmapNodes(),
    edges: mindmapEdges(),
    orientation: mindmapOrientation(),
  });

type CreateMindmapDto = MindmapModel & { id: Id };
type CreateMindmapPayload = z.infer<
  ReturnType<typeof createMindmapPayloadSchema>
>;

export { createMindmapPayloadSchema };
export type { CreateMindmapDto, CreateMindmapPayload };
