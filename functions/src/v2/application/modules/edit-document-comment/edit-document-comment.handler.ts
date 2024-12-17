import { type ProtectedControllerHandlerContext } from '@utils/controller';
import {
  type EditDocumentCommentDto,
  type EditDocumentCommentPayload,
} from './edit-document-comment.contract';
import { findAccessibleDocument } from '@services/documents.service';
import { DocumentCommentModel } from '@domain/models/document-comment';
import { errors } from '@utils/errors';
import { nowISO } from '@libs/helpers/stamps';

const editDocumentCommentHandler = async ({
  payload,
  context,
}: {
  payload: EditDocumentCommentPayload;
  context: ProtectedControllerHandlerContext;
}): Promise<EditDocumentCommentDto> => {
  const documentCommentRef = context.db
    .collection(`documents-comments`)
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
    throw errors.badRequest(`Cannot find document comment`);
  }

  if (documentComment.authorId !== payload.comment.authorId) {
    throw errors.badRequest(`You're not allowed to change this comment`);
  }

  const mdate = nowISO();

  const updateDocumentData: Pick<DocumentCommentModel, 'content' | 'mdate'> = {
    mdate,
    content: payload.comment.content,
  };

  await documentCommentRef.update(updateDocumentData);

  return {
    ...documentComment,
    ...updateDocumentData,
    id: payload.comment.id,
  };
};

export { editDocumentCommentHandler };
