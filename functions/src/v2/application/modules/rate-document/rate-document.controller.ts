import { protectedController } from '../../../libs/framework/controller';
import { z } from 'zod';
import { validators } from '../../utils/validators';
import { parse } from '../../../libs/framework/parse';
import { collections } from '../../database/collections';
import { nowISO, uuid } from '../../../libs/helpers/stamps';
import {
  DOCUMENT_RATING_CATEGORIES,
  DocumentRateModel,
} from '../../../domain/models/document-rate';
import { firestore } from 'firebase-admin';

const payloadSchema = z.object({
  id: validators.id,
  category: z.enum(DOCUMENT_RATING_CATEGORIES),
});

type PayloadSchema = z.infer<typeof payloadSchema>;

const rateDocumentController = protectedController(
  async (rawPayload, { uid }) => {
    const ref = collections
      .documentsRates()
      .doc((rawPayload as PayloadSchema).id);

    await firestore().runTransaction(async (transaction) => {
      const [snap, payload] = await Promise.all([
        transaction.get(ref),
        parse(payloadSchema, rawPayload),
      ]);
      const rate = snap.data() as DocumentRateModel | undefined;
      const now = nowISO();

      if (!rate) {
        const model: DocumentRateModel = {
          id: uuid(),
          rating: {
            ugly: 0,
            bad: 0,
            decent: 0,
            good: 0,
            perfect: 0,
            [payload.category]: 1,
          },
          voters: { [uid]: true },
          cdate: now,
          mdate: now,
        };

        transaction.set(ref, model);
      } else {
        const model: Pick<DocumentRateModel, 'mdate' | 'voters' | 'rating'> = {
          mdate: now,
          voters: {
            ...rate.voters,
            [uid]: true,
          },
          rating: {
            ...rate.rating,
            [payload.category]: rate.rating[payload.category] + 1,
          },
        };

        transaction.update(ref, model);
      }
    });
  },
);

export { rateDocumentController };
