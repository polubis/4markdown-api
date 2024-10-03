import { controller } from '../../utils/controller';
import { z } from 'zod';
import { validators } from '../../utils/validators';
import { parse } from '../../utils/parse';
import { nowISO } from '../../../libs/helpers/stamps';
import {
  DOCUMENT_RATING_CATEGORIES,
  DocumentRateModel,
} from '../../../domain/models/document-rate';
import { createDocumentRating } from '../../utils/create-document-rating';

const payloadSchema = z.object({
  documentId: validators.id,
  category: z.enum(DOCUMENT_RATING_CATEGORIES),
});

type Dto = DocumentRateModel['rating'];

const rateDocumentController = controller<Dto>(async (rawPayload, { db }) => {
  const { documentId, category } = await parse(payloadSchema, rawPayload);
  const now = nowISO();
  const documentRateRef = db.collection(`documents-rates`).doc(documentId);

  return await db.runTransaction(async (transaction) => {
    const [documentRateSnap] = await transaction.getAll(documentRateRef);

    const documentRateData = documentRateSnap.data() as
      | DocumentRateModel
      | undefined;

    if (!documentRateData) {
      const model: DocumentRateModel = {
        rating: createDocumentRating({ [category]: 1 }),
        cdate: now,
        mdate: now,
      };

      transaction.set(documentRateRef, model);

      return model.rating;
    }

    const model: Pick<DocumentRateModel, 'mdate' | 'rating'> = {
      mdate: now,
      rating: {
        ...documentRateData.rating,
        [category]: documentRateData.rating[category] + 1,
      },
    };

    transaction.update(documentRateRef, model);

    return model.rating;
  });
});

export { rateDocumentController };
