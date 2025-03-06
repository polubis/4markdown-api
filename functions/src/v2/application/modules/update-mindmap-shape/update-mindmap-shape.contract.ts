import { type MindmapModel } from '@domain/models/mindmap';
import {
  mindmapEdges,
  mindmapNodes,
  mindmapOrientation,
} from '@utils/mindmap-schemas';
import { date, id, Id } from '@utils/validators';
import { z } from 'zod';

const updateMindmapShapePayloadSchema = z.object({
  id,
  mdate: date,
  nodes: mindmapNodes(),
  edges: mindmapEdges(),
  orientation: mindmapOrientation(),
});

type UpdateMindmapShapePayload = z.infer<
  typeof updateMindmapShapePayloadSchema
>;
type UpdateMindmapShapeDto = MindmapModel & { id: Id };

export { updateMindmapShapePayloadSchema };
export type { UpdateMindmapShapeDto, UpdateMindmapShapePayload };
