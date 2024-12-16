import { protectedController } from '@utils/controller';
import { parse } from '@utils/parse';
import {
  type AddDocumentCommentDto,
  addDocumentCommentPayloadSchema,
} from './add-document-comment.contract';
import { addDocumentCommentHandler } from './add-document-comment.handler';

const addDocumentCommentController = protectedController<AddDocumentCommentDto>(
  async (rawPayload, context) => {
    return await addDocumentCommentHandler({
      context,
      payload: await parse(addDocumentCommentPayloadSchema, rawPayload),
    });
  },
);

export { addDocumentCommentController };
