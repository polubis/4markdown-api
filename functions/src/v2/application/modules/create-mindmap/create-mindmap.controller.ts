import { protectedController } from '@utils/controller';
import { parse } from '@utils/parse';

import {
  createMindmapPayloadSchema,
  type CreateMindmapDto,
} from './create-mindmap.contract';
import { createMindmapHandler } from './create-mindmap.handler';

const createMindmapController = protectedController<CreateMindmapDto>(
  async (rawPayload, context) => {
    return await createMindmapHandler({
      context,
      payload: await parse(createMindmapPayloadSchema, rawPayload),
    });
  },
);

export { createMindmapController };
