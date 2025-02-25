import { protectedController } from '@utils/controller';
import {
  getYourMindmapsPayloadSchema,
  type GetYourMindmapsDto,
} from './get-your-mindmaps.contract';
import { getYourMindmapsHandler } from './get-your-mindmaps.handler';
import { parse } from '@utils/parse';

const getYourMindmapsController = protectedController<GetYourMindmapsDto>(
  async (payload, context) => {
    return await getYourMindmapsHandler({
      context,
      payload: await parse(getYourMindmapsPayloadSchema, payload),
    });
  },
);

export { getYourMindmapsController };
