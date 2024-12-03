import { protectedController } from '@utils/controller';
import { parse } from '@utils/parse';
import {
  updateDocumentNamePayloadSchema,
  type UpdateDocumentNameDto,
} from './update-document-name.contract';
import { updateDocumentNameHandler } from './update-document-name.handler';
import { decodeBase64Asset } from '@libs/decoding/decode-base-64-asset';

const uploadImageController = protectedController<UpdateDocumentNameDto>(
  async (rawPayload, context) => {
    decodeBase64Asset(rawPayload)
    return updateDocumentNameHandler({
      payload: await parse(updateDocumentNamePayloadSchema, rawPayload),
      context,
    });
  },
);

export { uploadImageController };
