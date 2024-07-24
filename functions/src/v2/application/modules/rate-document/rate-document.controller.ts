import { protectedController } from '../../../libs/framework/controller';
import { z } from 'zod';
import { validators } from '../../utils/validators';
import { parse } from '../../../libs/framework/parse';
import { nowISO } from '../../../libs/helpers/stamps';
import {
  DOCUMENT_RATING_CATEGORIES,
  DocumentRateModel,
} from '../../../domain/models/document-rate';
import { firestore } from 'firebase-admin';
import { errors } from '../../../libs/framework/errors';
import { getDocumentRate } from '../../services/documents-rates/get-document-rate.service';
import { getUserDocument } from '../../services/documents/get-user-document.service';

const payloadSchema = z.object({
  documentId: validators.id,
  category: z.enum(DOCUMENT_RATING_CATEGORIES),
});

const rateDocumentController = protectedController(
  async (rawPayload, { uid }) => {
    const { documentId, category } = await parse(payloadSchema, rawPayload);
    const { runTransaction } = firestore();

    await runTransaction(async (transaction) => {
      const [documentRate, document] = await Promise.all([
        getDocumentRate({ documentId, action: transaction.get }),
        getUserDocument({ uid, documentId, action: transaction.get }),
      ]);

      if (!document.data) throw errors.notFound(`Document not found`);

      if (document.data.visibility === `private`)
        throw errors.badRequest(`Cannot add rate for private document`);

      const now = nowISO();

      if (!documentRate.data) {
        const model: DocumentRateModel = {
          rating: {
            ugly: 0,
            bad: 0,
            decent: 0,
            good: 0,
            perfect: 0,
            [category]: 1,
          },
          voters: { [uid]: category },
          cdate: now,
          mdate: now,
        };

        transaction.set(documentRate.ref, model);

        return;
      }

      if (documentRate.data.voters[uid] === category)
        throw errors.badRequest(
          `Already voted for category ${category}. Select another one if you want to change your opinion`,
        );

      const model: Pick<DocumentRateModel, 'mdate' | 'voters' | 'rating'> = {
        mdate: now,
        voters: {
          ...documentRate.data.voters,
          [uid]: category,
        },
        rating: {
          ...documentRate.data.rating,
          [category]: documentRate.data.rating[category] + 1,
        },
      };

      transaction.update(documentRate.ref, model);
    });
  },
);

export { rateDocumentController };
