import { nowISO, uuid } from '@libs/helpers/stamps';
import type { DocumentModel, DocumentsModel } from '@domain/models/document';
import { errors } from '@utils/errors';
import type {
  CreateDocumentDto,
  CreateDocumentPayload,
} from './create-document.contract';
import { type ProtectedControllerHandlerContext } from '@utils/controller';

const createDocumentHandler = async ({
  payload,
  context: { db, uid },
}: {
  payload: CreateDocumentPayload;
  context: ProtectedControllerHandlerContext;
}) => {
  const documentsRef = db.collection(`docs`).doc(uid);
  const documentsSnap = await documentsRef.get();

  const documents = documentsSnap.data() as DocumentsModel | undefined;

  const id = uuid();
  const cdate = nowISO();

  const documentModel: DocumentModel = {
    cdate,
    mdate: cdate,
    name: payload.name.raw,
    code: payload.code,
    path: payload.name.path,
    visibility: `private`,
  };

  const documentsModel: DocumentsModel = {
    [id]: documentModel,
  };

  const dto: CreateDocumentDto = {
    ...documentModel,
    id,
  };

  if (!documents) {
    await documentsRef.set(documentsModel);
    return dto;
  }

  const exists = Object.values(documents).some(
    (document) => document.path === payload.name.path,
  );

  if (exists) {
    throw errors.exists(`Document with ${payload.name.raw} already exists`);
  }

  await documentsRef.update(documentsModel);

  return dto;
};

export { createDocumentHandler };
