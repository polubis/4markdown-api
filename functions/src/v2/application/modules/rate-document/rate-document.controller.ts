import { controller } from '@utils/controller';
import { z } from 'zod';
import { id } from '@utils/validators';
import { parse } from '@utils/parse';
import { nowISO } from '@libs/helpers/stamps';
import { RATING_CATEGORIES, RateModel } from '@domain/models/rate';
import { createRating } from '@utils/create-rating';

const payloadSchema = z.object({
  documentId: id,
  category: z.enum(RATING_CATEGORIES),
});

type Dto = RateModel['rating'];

const rateDocumentController = controller<Dto>(async (rawPayload, { db }) => {
  const { documentId, category } = await parse(payloadSchema, rawPayload);
  const now = nowISO();
  const documentRateRef = db.collection(`documents-rates`).doc(documentId);

  return await db.runTransaction(async (transaction) => {
    const [documentRateSnap] = await transaction.getAll(documentRateRef);

    const documentRateData = documentRateSnap.data() as RateModel | undefined;

    if (!documentRateData) {
      const model: RateModel = {
        rating: createRating({ [category]: 1 }),
        cdate: now,
        mdate: now,
      };

      transaction.set(documentRateRef, model);

      return model.rating;
    }

    const model: Pick<RateModel, 'mdate' | 'rating'> = {
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
