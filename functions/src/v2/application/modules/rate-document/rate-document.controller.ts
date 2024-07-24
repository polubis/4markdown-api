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
import { errors } from '../../../libs/framework/errors';
import { DocumentModel, DocumentsModel } from '../../../domain/models/document';
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

      if (!document) throw errors.notFound(`Documents not found`);

      const now = nowISO();

      if (!documentRate) {
        const model: DocumentRateModel = {
          id: uuid(),
          rating: {
            ugly: 0,
            bad: 0,
            decent: 0,
            good: 0,
            perfect: 0,
            [category]: 1,
          },
          voters: { [uid]: true },
          cdate: now,
          mdate: now,
        };

        transaction.set(documentRatesRef, model);
      }

      // if (!documentRateData) {
      //   const model: DocumentRateModel = {
      //     id: uuid(),
      //     rating: {
      //       ugly: 0,
      //       bad: 0,
      //       decent: 0,
      //       good: 0,
      //       perfect: 0,
      //       [payload.category]: 1,
      //     },
      //     voters: { [uid]: true },
      //     cdate: now,
      //     mdate: now,
      //   };

      //   transaction.set(documentRatesRef, model);
      // } else {
      //   const model: Pick<DocumentRateModel, 'mdate' | 'voters' | 'rating'> = {
      //     mdate: now,
      //     voters: {
      //       ...documentRateData.voters,
      //       [uid]: true,
      //     },
      //     rating: {
      //       ...documentRateData.rating,
      //       [payload.category]: documentRateData.rating[payload.category] + 1,
      //     },
      //   };

      //   transaction.update(documentRatesRef, model);
      // }
    });
  },
);

export { rateDocumentController };

// const payload = await parse(payloadSchema, rawPayload);
// const documentRef = collections.documents().doc(uid);
// const documentRatesRef = collections.documentsRates().doc(payload.id);

// await firestore().runTransaction(async (transaction) => {
//   const [documentRateSnap, documentSnap] = await Promise.all([
//     transaction.get(documentRatesRef),
//     transaction.get(documentRef),
//   ]);

//   if (!documentSnap.exists)
//     throw errors.notFound(`Documents collection not found`);

//   const documents = documentSnap.data() as DocumentsModel | undefined;

//   if (!documents) throw errors.notFound(`Document data not found`);

//   const document = documents[payload.id] as DocumentModel | undefined;

//   if (!document) {
//     throw errors.notFound(`Document not found`);
//   }

//   const documentRateData = documentRateSnap.data() as
//     | DocumentRateModel
//     | undefined;
//   const now = nowISO();

// if (!documentRateData) {
//   const model: DocumentRateModel = {
//     id: uuid(),
//     rating: {
//       ugly: 0,
//       bad: 0,
//       decent: 0,
//       good: 0,
//       perfect: 0,
//       [payload.category]: 1,
//     },
//     voters: { [uid]: true },
//     cdate: now,
//     mdate: now,
//   };

//   transaction.set(documentRatesRef, model);
// } else {
//   const model: Pick<DocumentRateModel, 'mdate' | 'voters' | 'rating'> = {
//     mdate: now,
//     voters: {
//       ...documentRateData.voters,
//       [uid]: true,
//     },
//     rating: {
//       ...documentRateData.rating,
//       [payload.category]: documentRateData.rating[payload.category] + 1,
//     },
//   };

//   transaction.update(documentRatesRef, model);
// }
// });
