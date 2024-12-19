import { protectedController } from '@utils/controller';
import { parse } from '@utils/parse';
import {
  type EditDocumentCommentDto,
  editDocumentCommentPayloadSchema,
} from './edit-document-comment.contract';
import { editDocumentCommentHandler } from './edit-document-comment.handler';

const editDocumentCommentController =
  protectedController<EditDocumentCommentDto>(async (rawPayload, context) => {
    return await editDocumentCommentHandler({
      context,
      payload: await parse(editDocumentCommentPayloadSchema, rawPayload),
    });
  });

export { editDocumentCommentController };
