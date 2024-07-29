import { protectedController } from '../../../libs/framework/controller';
import { z } from 'zod';
import { validators } from '../../utils/validators';
import { parse } from '../../../libs/framework/parse';
import { nowISO } from '../../../libs/helpers/stamps';
import {
  DOCUMENT_RATING_CATEGORIES,
  DocumentRateModel,
} from '../../../domain/models/document-rate';
import { errors } from '../../../libs/framework/errors';
import { DocumentModel, DocumentsModel } from '../../../domain/models/document';
import type { DBInstance } from '../../database/database';

const payloadSchema = z.object({
  documentId: validators.id,
  category: z.enum(DOCUMENT_RATING_CATEGORIES),
});

const rateDocumentController = (db: DBInstance) =>
  protectedController(async (rawPayload, { uid }) => {
    const { documentId, category } = await parse(payloadSchema, rawPayload);
    const documentRateRef = db.collection(`documents-rates`).doc(documentId);
    const documentsRef = db.collection(`docs`).doc(uid);

    await db.runTransaction(async (transaction) => {
      const [documentRateSnap, documentsSnap] = await transaction.getAll(
        documentRateRef,
        documentsRef,
      );

      const documentsData = documentsSnap.data() as DocumentsModel | undefined;

      if (!documentsData) throw errors.notFound(`Cannot find documents`);

      const documentData = documentsData[documentId] as
        | DocumentModel
        | undefined;

      if (!documentData) throw errors.notFound(`Cannot find document`);

      if (documentData.visibility === `private`)
        throw errors.badRequest(`Private documents cannot be rated`);

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
  });

export { rateDocumentController };
