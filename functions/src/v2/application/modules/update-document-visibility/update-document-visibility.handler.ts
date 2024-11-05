import { nowISO, uuid } from '@libs/helpers/stamps';
import {
  DocumentModelVisibility,
  type DocumentModel,
  type DocumentsModel,
} from '@domain/models/document';
import { errors } from '@utils/errors';

import { type ProtectedControllerHandlerContext } from '@utils/controller';
import {
  type UpdateDocumentVisibilityPayload,
  type UpdateDocumentVisibilityDto,
} from './update-document-visibility.contract';

const updateDocumentVisibilityHandler = async ({
  payload,
  context: { db, uid },
}: {
  payload: UpdateDocumentVisibilityPayload;
  context: ProtectedControllerHandlerContext;
}): Promise<UpdateDocumentVisibilityDto> => {
  const userDocumentsRef = db.collection(`docs`).doc(uid);
  const userDocumentsSnap = await userDocumentsRef.get();
  const userDocuments = userDocumentsSnap.data() as DocumentsModel | undefined;

  if (!userDocuments) throw errors.notFound(`Document data not found`);

  const userDocument = userDocuments[payload.id] as DocumentModel | undefined;

  if (!userDocument) {
    throw errors.notFound(`Document not found`);
  }

  if (payload.mdate !== userDocument.mdate) {
    throw errors.outOfDate(`The document has been already changed`);
  }
};

export { updateDocumentVisibilityHandler };
