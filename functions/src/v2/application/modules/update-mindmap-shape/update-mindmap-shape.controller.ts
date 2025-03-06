import { protectedController } from '@utils/controller';
import { parse } from '@utils/parse';
import {
  UpdateMindmapShapeDto,
  updateMindmapShapePayloadSchema,
} from './update-mindmap-shape.contract';
import { updateMindmapShapeHandler } from './update-mindmap-shape.handler';

const updateMindmapShapeController = protectedController<UpdateMindmapShapeDto>(
  async (rawPayload, context) => {
    return await updateMindmapShapeHandler({
      context,
      payload: await parse(updateMindmapShapePayloadSchema, rawPayload),
    });
  },
);

export { updateMindmapShapeController };
