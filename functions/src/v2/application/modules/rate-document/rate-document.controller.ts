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
    const [payload, snap] = await Promise.all([
      parse(payloadSchema, rawPayload),
      ref.get(),
    ]);
    const rate = snap.data() as DocumentRateModel | undefined;

    if (!rate) {
      const now = nowISO();
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

      await ref.set(model);

      return {};
    }

    const model: Pick<DocumentRateModel, 'mdate' | 'voters' | 'rating'> = {
      mdate: nowISO(),
      voters: {
        ...rate.voters,
        [uid]: true,
      },
      rating: {
        ...rate.rating,
        [payload.category]: rate.rating[payload.category] + 1,
      },
    };

    await ref.update(model);

    return {};
  },
);

export { rateDocumentController };
