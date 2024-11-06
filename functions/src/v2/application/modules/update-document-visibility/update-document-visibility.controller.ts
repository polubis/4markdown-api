import { protectedController } from '@utils/controller';
import { parse } from '@utils/parse';
import {
  type UpdateDocumentVisibilityDto,
  updateDocumentVisibilityPayloadSchema,
} from './update-document-visibility.contract';
import { updateDocumentVisibilityHandler } from './update-document-visibility.handler';

// 4. Craft migration script and test it on develop
// before that rename git flow article name
// "adds empty tag" for each tag if no tags
// // adds path to every document type
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
