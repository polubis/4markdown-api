import { type MindmapModel } from '@domain/models/mindmap';
import { date, id, Id, name } from '@utils/validators';
import { z } from 'zod';

const updateMindmapNamePayloadSchema = z.object({
  id,
  name: name(),
  mdate: date,
});

type UpdateMindmapNamePayload = z.infer<typeof updateMindmapNamePayloadSchema>;
type UpdateMindmapNameDto = MindmapModel & { id: Id };

export { updateMindmapNamePayloadSchema };
export type { UpdateMindmapNameDto, UpdateMindmapNamePayload };
