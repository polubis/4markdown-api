import { errors } from '@utils/errors';
import { protectedController } from '@utils/controller';
import { z } from 'zod';
import { type Date, validators } from '@utils/validators';
import { parse } from '@utils/parse';
import type { DocumentModel, DocumentsModel } from '@domain/models/document';
import { nowISO } from '@libs/helpers/stamps';
import { documentCodeSchema } from '@utils/document-schemas';

const payloadSchema = z.object({
  id: validators.id,
  mdate: validators.date,
  code: documentCodeSchema,
});

type Dto = {
  mdate: Date;
};

const updateDocumentCodeController = protectedController<Dto>(
  async (rawPayload, { uid, db }) => {
    const ref = db.collection(`docs`).doc(uid);

    const [payload, snap] = await Promise.all([
      parse(payloadSchema, rawPayload),
      ref.get(),
    ]);

    const documents = snap.data() as DocumentsModel | undefined;

    if (!documents) throw errors.notFound(`Document data not found`);

    const document = documents[payload.id] as DocumentModel | undefined;

    if (!document) {
      throw errors.notFound(`Document not found`);
    }

    if (payload.mdate !== document.mdate) {
      throw errors.outOfDate(`The document has been already changed`);
    }

    const mdate = nowISO();

    const model: DocumentsModel = {
      [payload.id]: {
        ...document,
        code: payload.code,
        mdate,
      },
    };

    await ref.update(model);

    return { mdate };
  },
);

export { updateDocumentCodeController };
