import { type ProtectedControllerHandlerContext } from '@utils/controller';
import {
  type AddDocumentCommentDto,
  type AddDocumentCommentPayload,
} from './add-document-comment.contract';
import { nowISO } from '@libs/helpers/stamps';
import { DocumentCommentModel } from '@domain/models/document-comment';
import { createRating } from '@utils/create-rating';

const addDocumentCommentHandler = async ({
  payload,
  context: { db, uid },
}: {
  payload: AddDocumentCommentPayload;
  context: ProtectedControllerHandlerContext;
}): Promise<AddDocumentCommentDto> => {
  const documentCommentsRef = db
    .collection(`documents-comments`)
    .doc(payload.documentId)
    .collection(`comments`);

  const cdate = nowISO();

  const documentCommentModel: DocumentCommentModel = {
    authorId: uid,
    cdate,
    mdate: cdate,
    content: payload.content,
    rating: createRating(),
    replies: [],
  };

  await documentCommentsRef.add(documentCommentModel);

  return documentCommentModel;
};

export { addDocumentCommentHandler };
