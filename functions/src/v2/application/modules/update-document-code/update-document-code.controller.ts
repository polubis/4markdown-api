import { errors } from '../../../libs/framework/errors';
import { protectedController } from '../../../libs/framework/controller';
import { z } from 'zod';
import { validators } from '../../utils/validators';
import { parse } from '../../../libs/framework/parse';
import { collections } from '../../database/collections';
import { DocumentsModel } from '../../../domain/models/document';
import { nowISO } from '../../../libs/helpers/stamps';
import { getUserDocument } from '../../services/documents/get-user-document.service';

const payloadSchema = z.object({
  id: validators.id,
  mdate: validators.date,
  code: validators.document.code,
});

const updateDocumentCodeController = protectedController(
  async (rawPayload, { uid }) => {
    const ref = collections.documents().doc(uid);
    const payload = await parse(payloadSchema, rawPayload);
    const document = await getUserDocument({ uid, documentId: payload.id });

    if (!document.data) throw errors.notFound(`Document not found`);

    if (payload.mdate !== document.data.mdate)
      throw errors.outOfDate(`The document has been already changed`);

    const mdate = nowISO();

    await ref.update(<DocumentsModel>{
      [payload.id]: {
        ...document.data,
        code: payload.code,
        mdate,
      },
    });

    return { mdate };
  },
);

export { updateDocumentCodeController };
