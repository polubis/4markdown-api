import { protectedController } from '@utils/controller';
import { parse } from '@utils/parse';
import {
  UpdateMindmapNameDto,
  updateMindmapNamePayloadSchema,
} from './update-mindmap-name.contract';
import { updateMindmapNameHandler } from './update-mindmap-name.handler';

const updateMindmapNameController = protectedController<UpdateMindmapNameDto>(
  async (rawPayload, context) => {
    return await updateMindmapNameHandler({
      context,
      payload: await parse(updateMindmapNamePayloadSchema, rawPayload),
    });
  },
);

export { updateMindmapNameController };
