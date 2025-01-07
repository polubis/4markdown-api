import { type ProtectedControllerHandlerContext } from '@utils/controller';
import { type DocumentCommentModel } from '@domain/models/document-comment';
import { errors } from '@utils/errors';
import {
  type DeleteDocumentCommentDto,
  type DeleteDocumentCommentPayload,
} from './delete-document-comment.contract';
import { findAccessibleDocument } from '@utils/find-documents';

const deleteDocumentCommentHandler = async ({
  payload,
  context,
}: {
  payload: DeleteDocumentCommentPayload;
  context: ProtectedControllerHandlerContext;
}): Promise<DeleteDocumentCommentDto> => {
  const documentCommentRef = context.db
    .collection(`document-comments`)
    .doc(payload.document.id)
    .collection(`comments`)
    .doc(payload.comment.id);

  const [, documentCommentSnap] = await Promise.all([
    findAccessibleDocument({ db: context.db, payload }),
    documentCommentRef.get(),
  ]);

  const documentComment = documentCommentSnap.data() as
    | DocumentCommentModel
    | undefined;

  if (!documentComment) {
    throw errors.badRequest(`Cannot find document comment to delete`);
  }

  if (documentComment.authorId !== context.uid) {
    throw errors.badRequest(`You're not allowed to delete this comment`);
  }

  if (documentComment.mdate !== payload.comment.mdate) {
    throw errors.outOfDate(
      `The comment has been already changed. You cannot delete it now`,
    );
  }

  await documentCommentRef.delete();
};

export { deleteDocumentCommentHandler };
