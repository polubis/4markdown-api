import { protectedController } from '../../utils/controller';
import { z } from 'zod';
import { validators } from '../../utils/validators';
import { parse } from '../../utils/parse';
import { errors } from '../../utils/errors';
import { FieldValue } from 'firebase-admin/firestore';

const payloadSchema = z.object({
  id: validators.id,
});

type Dto = void;

const deleteDocumentController = protectedController<Dto>(
  async (rawPayload, { uid, db }) => {
    const { id: documentId } = await parse(payloadSchema, rawPayload);
    const documentRef = db.collection(`docs`).doc(uid);
    const documentRateRef = db.collection(`documents-rates`).doc(documentId);

    return await db.runTransaction(async (transaction) => {
      const [documentSnap, documentRateSnap] = await transaction.getAll(
        documentRef,
        documentRateRef,
      );

      const documentData = documentSnap.data();

      if (!documentData) {
        throw errors.notFound(`Document not found`);
      }

      documentData[documentId] = FieldValue.delete();

      transaction.update(documentRef, documentData);

      if (documentRateSnap) {
        transaction.delete(documentRateRef);
      }
    });
  },
);

export { deleteDocumentController };
