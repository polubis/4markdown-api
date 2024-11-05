import { nowISO } from '@libs/helpers/stamps';
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
import { type DBInstance } from '@database/database';

const containsDuplicateInPermanentDocuments = async (
  payload: Extract<
    UpdateDocumentVisibilityPayload,
    { visibility: DocumentModelVisibility.Permanent }
  >,
  db: DBInstance,
): Promise<boolean> => {
  const allDocumentsSnap = (await db.collection(`docs`).get()).docs;

  for (const userDocumentsSnap of allDocumentsSnap) {
    const userDocuments = userDocumentsSnap.data() as DocumentsModel;

    const hasDuplicate = Object.entries(userDocuments).some(
      ([documentId, document]) =>
        documentId !== payload.id &&
        document.visibility === DocumentModelVisibility.Permanent &&
        document.path === payload.name.path,
    );

    if (hasDuplicate) return true;
  }

  return false;
};

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

  const mdate = nowISO();

  if (
    payload.visibility === DocumentModelVisibility.Private ||
    payload.visibility === DocumentModelVisibility.Public
  ) {
    const model: DocumentsModel = {
      [payload.id]: {
        cdate: userDocument.cdate,
        code: userDocument.code,
        name: userDocument.name,
        path: userDocument.path,
        mdate,
        visibility: payload.visibility,
      },
    };
    const dto: UpdateDocumentVisibilityDto = {
      ...model[payload.id],
      id: payload.id,
    };

    await userDocumentsRef.update(model);

    return dto;
  }

  if (payload.visibility === DocumentModelVisibility.Permanent) {
    const hasDuplicated = await containsDuplicateInPermanentDocuments(
      payload,
      db,
    );

    if (hasDuplicated) {
      throw errors.exists(
        `Document with provided name already exists, please change name`,
      );
    }
  }

  throw errors.badRequest(`Unsupported visibility`);
};

export { updateDocumentVisibilityHandler };
