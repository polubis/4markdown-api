import type {
  DocumentModel,
  PermanentDocumentModel,
} from '../../../domain/models/document';
import { DocumentRateModel } from '../../../domain/models/document-rate';
import type { UserProfileModel } from '../../../domain/models/user-profile';
import { controller } from '../../utils/controller';
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

  usersProfilesSnap.forEach((userSnap) => {
    usersProfiles[userSnap.id] = userSnap.data() as UserProfileModel;
  });

  const documentsRates: Record<Id, DocumentRateModel['rating']> = {};

  documentsRatesSnap.forEach((documentRateSnap) => {
    documentsRates[documentRateSnap.id] =
      documentRateSnap.data() as DocumentRateModel['rating'];
  });

  const permanentDocuments: Dto = [];

  documentsSnap.docs.forEach((documentsListSnap) => {
    const documentsListData = Object.entries(documentsListSnap.data());

    documentsListData.forEach(([documentId, document]: [Id, DocumentModel]) => {
      if (document.visibility === `permanent`) {
        permanentDocuments.push({
          ...document,
          id: documentId,
          author: usersProfiles[documentId] ?? null,
          rating: documentsRates[documentId] ?? {
            ugly: 0,
            bad: 0,
            decent: 0,
            good: 0,
            perfect: 0,
          },
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
