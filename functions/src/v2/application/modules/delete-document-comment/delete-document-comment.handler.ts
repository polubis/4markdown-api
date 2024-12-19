import { type ProtectedControllerHandlerContext } from '@utils/controller';
import { type DocumentCommentModel } from '@domain/models/document-comment';
import { errors } from '@utils/errors';
import {
  type DeleteDocumentCommentDto,
  type DeleteDocumentCommentPayload,
} from './delete-document-comment.contract';

const deleteDocumentCommentHandler = async ({
  payload,
  context,
}: {
  payload: DeleteDocumentCommentPayload;
  context: ProtectedControllerHandlerContext;
}): Promise<DeleteDocumentCommentDto> => {
  const documentCommentRef = context.db
    .collection(`document-comments`)
    .doc(payload.comment.id);

  const [documentCommentSnap] = await Promise.all([documentCommentRef.get()]);

  const documentComment = documentCommentSnap.data() as
    | DocumentCommentModel
    | undefined;

  if (!documentComment) {
    throw errors.badRequest(`Cannot find document comment`);
  }

  if (documentComment.authorId !== context.uid) {
    throw errors.badRequest(`You're not allowed to delete this comment`);
  }

  if (documentComment.mdate !== payload.comment.mdate) {
    throw errors.outOfDate(`The comment has been already changed`);
  }

  await documentCommentRef.delete();
};

export { deleteDocumentCommentHandler };
