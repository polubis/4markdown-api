import { protectedController } from '@utils/controller';
import { parse } from '@utils/parse';
import {
  updateDocumentNamePayloadSchema,
  type UpdateDocumentNameDto,
} from './update-document-name.contract';
import { updateDocumentNameHandler } from './update-document-name.handler';

const updateDocumentNameController = protectedController<UpdateDocumentNameDto>(
  async (rawPayload, context) => {
    return updateDocumentNameHandler({
      payload: await parse(updateDocumentNamePayloadSchema, rawPayload),
      context,
    });
  },
);

export { updateDocumentNameController };
