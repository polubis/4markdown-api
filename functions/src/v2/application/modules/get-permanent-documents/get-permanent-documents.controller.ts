import type {
  DocumentModel,
  PermanentDocumentModel,
} from '../../../domain/models/document';
import { DocumentRateModel } from '../../../domain/models/document-rate';
import type { UserProfileModel } from '../../../domain/models/user-profile';
import { controller } from '../../utils/controller';
import { createDocumentRating } from '../../utils/create-document-rating';
import type { Id } from '../../utils/validators';

type Dto = (PermanentDocumentModel & {
  id: Id;
  author: UserProfileModel | null;
  rating: DocumentRateModel['rating'];
})[];

const getPermanentDocumentsController = controller<Dto>(async (_, { db }) => {
  const [documentsSnap, usersProfilesSnap, documentsRatesSnap] =
    await Promise.all([
      db.collection(`docs`).get(),
      db.collection(`users-profiles`).get(),
      db.collection(`documents-rates`).get(),
    ]);

  const usersProfiles: Record<Id, UserProfileModel> = {};

  usersProfilesSnap.docs.forEach((userSnap) => {
    usersProfiles[userSnap.id] = userSnap.data() as UserProfileModel;
  });

  const documentsRates: Record<Id, DocumentRateModel['rating']> = {};

  documentsRatesSnap.docs.forEach((documentRateSnap) => {
    documentsRates[documentRateSnap.id] = (
      documentRateSnap.data() as DocumentRateModel
    ).rating;
  });

  const permanentDocuments: Dto = [];

  const defaultRate = createDocumentRating();

  documentsSnap.docs.forEach((documentsListSnap) => {
    const userId = documentsListSnap.id;
    const documentsListData = Object.entries(documentsListSnap.data());

    documentsListData.forEach(([documentId, document]: [Id, DocumentModel]) => {
      if (document.visibility === `permanent`) {
        permanentDocuments.push({
          ...document,
          id: documentId,
          author: usersProfiles[userId] ?? null,
          rating: documentsRates[documentId] ?? defaultRate,
        });
      }
    });
  });

  return permanentDocuments.sort((prev, curr) => {
    if (prev.cdate > curr.cdate) return -1;
    if (prev.cdate === curr.cdate) return 0;
    return 1;
  });
});

export { getPermanentDocumentsController };
