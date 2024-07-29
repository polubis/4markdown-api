import { protectedController } from '../../utils/controller';
import { z } from 'zod';
import { validators } from '../../utils/validators';
import { parse } from '../../../libs/framework/parse';
import { nowISO } from '../../../libs/helpers/stamps';
import {
  DOCUMENT_RATING_CATEGORIES,
  DocumentRateModel,
} from '../../../domain/models/document-rate';

const payloadSchema = z.object({
  documentId: validators.id,
  category: z.enum(DOCUMENT_RATING_CATEGORIES),
});

const rateDocumentController = protectedController(
  async (rawPayload, { uid, db }) => {
    const { documentId, category } = await parse(payloadSchema, rawPayload);
    const documentRateRef = db.collection(`documents-rates`).doc(documentId);

    await db.runTransaction(async (transaction) => {
      const documentRateSnap = await transaction.get(documentRateRef);
      const now = nowISO();

      const documentRateData = documentRateSnap.data() as
        | DocumentRateModel
        | undefined;

      if (!documentRateData) {
        const model: DocumentRateModel = {
          rating: {
            ugly: 0,
            bad: 0,
            decent: 0,
            good: 0,
            perfect: 0,
          },
          voters: { [uid]: category },
          cdate: now,
          mdate: now,
        };

        model.rating[category] = 1;

        transaction.set(documentRateRef, model);

        return model.rating;
      }

      const currentCategory = documentRateData.voters[uid];

      if (currentCategory === category) return documentRateData.rating;

      const rating: DocumentRateModel['rating'] = {
        ...documentRateData.rating,
        [category]: documentRateData.rating[category] + 1,
      };

      if (currentCategory && rating[currentCategory] > 0) {
        rating[currentCategory] = rating[currentCategory] - 1;
      }

      const model: Pick<DocumentRateModel, 'mdate' | 'voters' | 'rating'> = {
        mdate: now,
        voters: {
          ...documentRateData.voters,
          [uid]: category,
        },
        rating,
      };

      transaction.update(documentRateRef, model);

      return model.rating;
    });
  },
);

export { rateDocumentController };
