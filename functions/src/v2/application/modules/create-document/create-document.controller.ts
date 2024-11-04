import { protectedController } from '@utils/controller';
import { parse } from '@utils/parse';
import {
  createDocumentPayloadSchema,
  type CreateDocumentDto,
} from './create-document.contract';
import { createDocumentHandler } from './create-document.handler';

const createDocumentController = protectedController<CreateDocumentDto>(
  async (rawPayload, context) => {
    return await createDocumentHandler({
      context,
      payload: await parse(createDocumentPayloadSchema, rawPayload),
    });
  },
);

export { createDocumentController };
