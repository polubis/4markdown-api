import { protectedController } from '@utils/controller';
import { parse } from '@utils/parse';
import {
  type DeleteDocumentCommentDto,
  deleteDocumentCommentPayloadSchema,
} from './delete-document-comment.contract';
import { deleteDocumentCommentHandler } from './delete-document-comment.handler';

const deleteDocumentCommentController =
  protectedController<DeleteDocumentCommentDto>(async (rawPayload, context) => {
    return await deleteDocumentCommentHandler({
      context,
      payload: await parse(deleteDocumentCommentPayloadSchema, rawPayload),
    });
  });

export { deleteDocumentCommentController };
