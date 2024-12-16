import { type ProtectedControllerHandlerContext } from '@utils/controller';
import {
  type AddDocumentCommentDto,
  type AddDocumentCommentPayload,
} from './add-document-comment.contract';
import { nowISO } from '@libs/helpers/stamps';
import { DocumentCommentModel } from '@domain/models/document-comment';
import { createRating } from '@utils/create-rating';
import {
  DocumentModelVisibility,
  DocumentsModel,
} from '@domain/models/document';
import { errors } from '@utils/errors';

const addDocumentCommentHandler = async ({
  payload,
  context,
}: {
  payload: AddDocumentCommentPayload;
  context: ProtectedControllerHandlerContext;
}): Promise<AddDocumentCommentDto> => {
  const documentsRef = context.db
    .collection(`docs`)
    .doc(payload.document.authorId);
  const documentsSnap = await documentsRef.get();

  const documents = documentsSnap.data() as DocumentsModel | undefined;
  const foundDocument = documents?.[payload.document.id];

  if (
    !foundDocument ||
    foundDocument.visibility === DocumentModelVisibility.Private
  ) {
    throw errors.badRequest(`Cannot find document to comment`);
  }

  const documentCommentsRef = context.db
    .collection(`documents-comments`)
    .doc(payload.document.id)
    .collection(`comments`);

  const cdate = nowISO();

  const documentCommentModel: DocumentCommentModel = {
    authorId: context.uid,
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
