import { type DBInstance } from '@database/database';
import {
  type PermanentDocumentModel,
  type PublicDocumentModel,
  type DocumentModel,
  type DocumentsModel,
  DocumentModelVisibility,
} from '@domain/models/document';
import { errors } from '@utils/errors';
import { type Id } from '@utils/validators';

const findDocument = async ({
  db,
  payload,
}: {
  db: DBInstance;
  payload: { document: { id: Id; authorId: Id } };
}): Promise<DocumentModel> => {
  const documentsRef = db.collection(`docs`).doc(payload.document.authorId);
  const documentsSnap = await documentsRef.get();

  const documents = documentsSnap.data() as DocumentsModel | undefined;
  const foundDocument = documents?.[payload.document.id];

  if (!foundDocument) {
    throw errors.badRequest(`Cannot find document`);
  }

  return foundDocument;
};

const findAccessibleDocument = async ({
  db,
  payload,
}: {
  db: DBInstance;
  payload: { document: { id: Id; authorId: Id } };
}): Promise<PublicDocumentModel | PermanentDocumentModel> => {
  const foundDocument = await findDocument({ db, payload });

  if (foundDocument.visibility === DocumentModelVisibility.Private) {
    throw errors.badRequest(`Cannot find document`);
  }

  return foundDocument;
};

export { findDocument, findAccessibleDocument };
