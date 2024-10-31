import { z } from 'zod';
import { protectedController } from '../../utils/controller';
import { type Id } from '../../utils/validators';
import { parse } from '../../utils/parse';
import { nowISO, uuid } from '../../../libs/helpers/stamps';
import type {
  DocumentModel,
  DocumentsModel,
  PrivateDocumentModel,
} from '../../../domain/models/document';
import { errors } from '../../utils/errors';
import {
  documentCodeSchema,
  documentNameSchema,
} from '../../utils/document-schemas';

const payloadSchema = z.object({
  name: documentNameSchema,
  code: documentCodeSchema,
});

type Dto = PrivateDocumentModel & { id: Id };

const createDocumentController = protectedController<Dto>(
  async (rawPayload, { uid, db }) => {
    const payload = await parse(payloadSchema, rawPayload);

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

    const dto: Dto = {
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
  },
);

export { createDocumentController };
