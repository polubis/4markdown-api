import { z } from 'zod';
import { validators, type Id } from '@utils/validators';
import { parse } from '@utils/parse';
import { nowISO, uuid } from '../../../libs/helpers/stamps';
import type {
  DocumentModel,
  DocumentsModel,
  PrivateDocumentModel,
} from '@domain/models/document';
import { protectedController } from '@utils/controller';
import { errors } from '@utils/errors';

const payloadSchema = z.object({
  name: validators.document.name,
  code: validators.document.code,
});

type Dto = PrivateDocumentModel & { id: Id };

const createDocumentController = protectedController<Dto>(
  async (rawPayload, { uid, db }) => {
    const documentsRef = db.collection(`docs`).doc(uid);
    const payload = await parse(payloadSchema, rawPayload);

    const id = uuid();
    const cdate = nowISO();

    const documentsSnap = await documentsRef.get();
    const documents = documentsSnap.data() as DocumentsModel | undefined;

    const documentModel: DocumentModel = {
      cdate,
      mdate: cdate,
      name: payload.name,
      code: payload.code,
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
      (document) => document.name === payload.name,
    );

    if (exists) {
      throw errors.exists(`Document with ${payload.name} already exists`);
    }

    await documentsRef.update(documentsModel);

    return dto;
  },
);

export { createDocumentController };
