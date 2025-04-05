import { errors } from '@utils/errors';
import { protectedController } from '@utils/controller';
import { z } from 'zod';
import { date, type Date, id } from '@utils/validators';
import { parse } from '@utils/parse';
import type { DocumentModel, DocumentsModel } from '@domain/models/document';
import { nowISO } from '@libs/helpers/stamps';
import { documentCodeSchema } from '@utils/document-schemas';
import { validateMarkdown } from '@utils/validate-markdown';

const payloadSchema = z.object({
  id,
  mdate: date,
  code: documentCodeSchema,
});

type Dto = {
  mdate: Date;
};

const updateDocumentCodeController = protectedController<Dto>(
  async (rawPayload, { uid, db }) => {
    const ref = db.collection(`docs`).doc(uid);
    const payload = await parse(payloadSchema, rawPayload);

    await validateMarkdown(payload.code);

    const snap = await ref.get();

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
