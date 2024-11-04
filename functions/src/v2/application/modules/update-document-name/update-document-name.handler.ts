import { nowISO } from '@libs/helpers/stamps';
import type { DocumentModel, DocumentsModel } from '@domain/models/document';
import { errors } from '@utils/errors';
import { type ProtectedControllerHandlerContext } from '@utils/controller';
import {
  type UpdateDocumentNameDto,
  type UpdateDocumentNamePayload,
} from './update-document-name.contract';
import { type DBInstance } from '@database/database';

const containsDuplicateInAccessibleDocuments = async (
  payload: UpdateDocumentNamePayload,
  db: DBInstance,
): Promise<boolean> => {
  const allDocumentsSnap = (await db.collection(`docs`).get()).docs;

  for (const userDocumentsSnap of allDocumentsSnap) {
    const userDocuments = userDocumentsSnap.data() as DocumentsModel;

    const hasDuplicate = Object.entries(userDocuments).some(
      ([documentId, document]) =>
        documentId !== payload.id &&
        document.visibility === `permanent` &&
        document.path === payload.name.path,
    );

    if (hasDuplicate) return true;
  }

  return false;
};

const updateDocumentNameHandler = async ({
  payload,
  context: { db, uid },
}: {
  payload: UpdateDocumentNamePayload;
  context: ProtectedControllerHandlerContext;
}): Promise<UpdateDocumentNameDto> => {
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

  const hasDuplicateInOwnDocuments = Object.entries(userDocuments).some(
    ([id, document]) =>
      id !== payload.id && document.path === payload.name.path,
  );

  if (
    hasDuplicateInOwnDocuments ||
    (userDocument.visibility === `permanent` &&
      (await containsDuplicateInAccessibleDocuments(payload, db)))
  ) {
    throw errors.exists(
      `Document with provided name already exists, please change name`,
    );
  }

  const mdate = nowISO();

  const model: DocumentsModel = {
    [payload.id]: {
      ...userDocument,
      path: payload.name.path,
      name: payload.name.raw,
      mdate,
    },
  };

  await userDocumentsRef.update(model);

  return { mdate };
};

export { updateDocumentNameHandler };
