import { type ProtectedControllerHandlerContext } from '@utils/controller';
import {
  type AddDocumentCommentDto,
  type AddDocumentCommentPayload,
} from './add-document-comment.contract';
import { nowISO } from '@libs/helpers/stamps';
import { DocumentCommentModel } from '@domain/models/document-comment';
import { createRating } from '@utils/create-rating';
import { findAccessibleDocument } from '@utils/find-documents';

const addDocumentCommentHandler = async ({
  payload,
  context,
}: {
  payload: AddDocumentCommentPayload;
  context: ProtectedControllerHandlerContext;
}): Promise<AddDocumentCommentDto> => {
  await findAccessibleDocument({
    db: context.db,
    payload,
  });

  const documentCommentsRef = context.db.collection(`document-comments`);

  const cdate = nowISO();

  const documentCommentModel: DocumentCommentModel = {
    authorId: context.uid,
    documentId: payload.document.id,
    cdate,
    mdate: cdate,
    content: payload.comment.content,
    rating: createRating(),
    replies: [],
  };

  const { id } = await documentCommentsRef.add(documentCommentModel);

  return {
    ...documentCommentModel,
    id,
  };
};

export { addDocumentCommentHandler };
