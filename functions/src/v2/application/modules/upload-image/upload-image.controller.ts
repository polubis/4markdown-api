import { protectedController } from '@utils/controller';
import { parse } from '@utils/parse';
import {
  type UploadImageDto,
  uploadImagePayloadSchema,
} from './upload-image.contract';
import { uploadImageHandler } from './upload-image.handler';

const uploadImageController = protectedController<UploadImageDto>(
  async (rawPayload, context) => {
    return await uploadImageHandler({
      context,
      payload: await parse(uploadImagePayloadSchema, rawPayload),
    });
  },
);

export { uploadImageController };
