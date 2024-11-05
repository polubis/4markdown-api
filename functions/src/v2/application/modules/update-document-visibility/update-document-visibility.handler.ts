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

const updateDocumentVisibilityHandler = async ({
  payload,
  context: { db, uid },
}: {
  payload: UpdateDocumentVisibilityPayload;
  context: ProtectedControllerHandlerContext;
}): Promise<UpdateDocumentVisibilityDto> => {
  const documentsCollectionRef = db.collection(`docs`);
  const userDocumentsRef = documentsCollectionRef.doc(uid);
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
    const allDocumentsSnap = (await documentsCollectionRef.get()).docs;

    let isDocumentDuplicated = false;

    for (const userDocumentsSnap of allDocumentsSnap) {
      const userDocuments = userDocumentsSnap.data() as DocumentsModel;

      isDocumentDuplicated = Object.entries(userDocuments).some(
        ([documentId, document]) =>
          documentId !== payload.id &&
          document.visibility === DocumentModelVisibility.Permanent &&
          document.path === payload.name.path,
      );

      if (isDocumentDuplicated) break;
    }

    if (isDocumentDuplicated) {
      throw errors.exists(
        `Document with provided name already exists, please change name`,
      );
    }

    const model: DocumentsModel = {
      [payload.id]: {
        cdate: userDocument.cdate,
        code: userDocument.code,
        name: payload.name.raw,
        path: payload.name.path,
        mdate,
        visibility: payload.visibility,
        description: payload.description,
        tags: payload.tags,
      },
    };
    const dto: UpdateDocumentVisibilityDto = {
      ...model[payload.id],
      id: payload.id,
    };

    await userDocumentsRef.update(model);

    return dto;
  }

  throw errors.badRequest(`Unsupported visibility`);
};

export { updateDocumentVisibilityHandler };
