import { errors } from '../../../libs/framework/errors';
import { protectedController } from '../../../libs/framework/controller';
import { z } from 'zod';
import { validators } from '../../utils/validators';
import { parse } from '../../../libs/framework/parse';
import { collections } from '../../database/collections';
import { DocumentModel, DocumentsModel } from '../../../domain/models/document';

const payloadSchema = z.object({
  id: validators.id,
  mdate: validators.date,
  code: validators.document.code,
});

const updateDocumentCodeController = protectedController(
  async (rawPayload, { uid }) => {
    const ref = collections.documents().doc(uid);

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

    const updatedDocuments: DocumentsModel = {
      [payload.id]: {
        ...document,
        code: payload.code,
      },
    };

    await ref.update(updatedDocuments);
  },
);

export { updateDocumentCodeController };
