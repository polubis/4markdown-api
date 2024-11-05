import { protectedController } from '@utils/controller';
import { parse } from '@utils/parse';
import {
  type UpdateDocumentVisibilityDto,
  updateDocumentVisibilityPayloadSchema,
} from './update-document-visibility.contract';

// 1. Add error throw when permanent document name is changed + tests
// 2. Finish update doc visibility controller
// 3. Remove dead code after that
// 4. Craft migration script and test it on develop
const updateDocumentVisibilityController =
  protectedController<UpdateDocumentVisibilityDto>(
    async (rawPayload, context) => {
      return await createDocumentHandler({
        context,
        payload: await parse(updateDocumentVisibilityPayloadSchema, rawPayload),
      });
    },
  );

export { updateDocumentVisibilityController };
