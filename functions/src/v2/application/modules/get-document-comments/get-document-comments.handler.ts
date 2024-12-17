import { type ControllerHandlerContext } from '@utils/controller';
import type {
  GetDocumentCommentsDto,
  GetDocumentCommentsPayload,
} from './get-document-comments.contract';
import { type DocumentCommentModel } from '@domain/models/document-comment';
import { findAccessibleDocument } from '@services/documents.service';

const getDocumentCommentsHandler = async ({
  payload,
  context,
}: {
  payload: GetDocumentCommentsPayload;
  context: ControllerHandlerContext;
}): Promise<GetDocumentCommentsDto> => {
  const [, documentCommentsSnap] = await Promise.all([
    findAccessibleDocument({ db: context.db, payload }),
    context.db
      .collection(`documents-comments`)
      .doc(payload.document.id)
      .collection(`comments`)
      .get(),
  ]);

  const comments: GetDocumentCommentsDto = [];

  for (const documentComment of documentCommentsSnap.docs) {
    const comment = documentComment.data() as DocumentCommentModel;
    comments.push(comment);
  }

  return comments;
};

export { getDocumentCommentsHandler };
