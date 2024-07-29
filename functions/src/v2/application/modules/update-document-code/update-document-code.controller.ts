import { errors } from '../../../libs/framework/errors';
import { protectedController } from '../../../libs/framework/controller';
import { z } from 'zod';
import { validators } from '../../utils/validators';
import { parse } from '../../../libs/framework/parse';
import { DocumentModel, DocumentsModel } from '../../../domain/models/document';
import { nowISO } from '../../../libs/helpers/stamps';
import { DBInstance } from '../../database/database';

const payloadSchema = z.object({
  id: validators.id,
  mdate: validators.date,
  code: validators.document.code,
});

const updateDocumentCodeController = (db: DBInstance) =>
  protectedController(async (rawPayload, { uid }) => {
    const ref = db.collection(`docs`).doc(uid);

    const [payload, snap] = await Promise.all([
      parse(payloadSchema, rawPayload),
      ref.get(),
    ]);

    if (!snap.exists) throw errors.notFound(`Documents collection not found`);

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

    await ref.update(<DocumentsModel>{
      [payload.id]: {
        ...document,
        code: payload.code,
        mdate,
      },
    });

    return { mdate };
  });

export { updateDocumentCodeController };
