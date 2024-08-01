import { protectedController } from '../../utils/controller';
import { z } from 'zod';
import { validators } from '../../utils/validators';
import { parse } from '../../utils/parse';
import { nowISO } from '../../../libs/helpers/stamps';
import {
  DOCUMENT_RATING_CATEGORIES,
  DocumentRateModel,
} from '../../../domain/models/document-rate';
import { UserDocumentsVotesModel } from '../../../domain/models/user-documents-votes';
import { createDocumentRating } from '../../utils/create-document-rating';

const payloadSchema = z.object({
  documentId: validators.id,
  category: z.enum(DOCUMENT_RATING_CATEGORIES),
});

type Dto = DocumentRateModel['rating'];

const rateDocumentController = protectedController<Dto>(
  async (rawPayload, { uid, db }) => {
    const { documentId, category } = await parse(payloadSchema, rawPayload);
    const now = nowISO();
    const documentRateRef = db.collection(`documents-rates`).doc(documentId);
    const userDocumentsVotesRef = db
      .collection(`users-documents-votes`)
      .doc(uid);

    return await db.runTransaction(async (transaction) => {
      const [documentRateSnap, userDocumentsVotesSnap] =
        await transaction.getAll(documentRateRef, userDocumentsVotesRef);

      const userDocumentsVotesData = userDocumentsVotesSnap.data() as
        | UserDocumentsVotesModel
        | undefined;

      if (userDocumentsVotesData) {
        transaction.update(userDocumentsVotesRef, { [documentId]: category });
      } else {
        transaction.set(userDocumentsVotesRef, { [documentId]: category });
      }

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

      const currentCategory = userDocumentsVotesData
        ? userDocumentsVotesData[uid]
        : undefined;

      if (currentCategory === category) return documentRateData.rating;

      const rating: DocumentRateModel['rating'] = {
        ...documentRateData.rating,
        [category]: documentRateData.rating[category] + 1,
      };

      if (currentCategory && rating[currentCategory] > 0) {
        rating[currentCategory] = rating[currentCategory] - 1;
      }

      const model: Pick<DocumentRateModel, 'mdate' | 'rating'> = {
        mdate: now,
        rating,
      };

      transaction.update(documentRateRef, model);

      return model.rating;
    });
  },
);

export { rateDocumentController };
