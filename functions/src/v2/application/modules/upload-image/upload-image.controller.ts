import { protectedController } from '@utils/controller';
import { parse } from '@utils/parse';
import { uploadImagePayloadSchema } from './upload-image.contract';

const uploadImageController = protectedController<UpdateDocumentVisibilityDto>(
  async (rawPayload, context) => {
    return await updateDocumentVisibilityHandler({
      context,
      payload: await parse(uploadImagePayloadSchema, rawPayload),
    });
  },
);

export { uploadImageController };
