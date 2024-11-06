import { protectedController } from '@utils/controller';
import { parse } from '@utils/parse';
import {
  type UpdateDocumentVisibilityDto,
  updateDocumentVisibilityPayloadSchema,
} from './update-document-visibility.contract';
import { updateDocumentVisibilityHandler } from './update-document-visibility.handler';

// 1. Paths haves invalid format
// 2. Fix migration script
const updateDocumentVisibilityController =
  protectedController<UpdateDocumentVisibilityDto>(
    async (rawPayload, context) => {
      return await updateDocumentVisibilityHandler({
        context,
        payload: await parse(updateDocumentVisibilityPayloadSchema, rawPayload),
      });
    },
  );

export { updateDocumentVisibilityController };
