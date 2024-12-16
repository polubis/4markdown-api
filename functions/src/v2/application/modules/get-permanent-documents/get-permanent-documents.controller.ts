import type {
  DocumentModel,
  PermanentDocumentModel,
} from '@domain/models/document';
import { RateModel } from '@domain/models/rate';
import type { UserProfileModel } from '@domain/models/user-profile';
import { controller } from '@utils/controller';
import { createRating } from '@utils/create-rating';
import type { Id } from '@utils/validators';

type Dto = (Required<PermanentDocumentModel> & {
  id: Id;
  author: UserProfileModel | null;
  rating: RateModel['rating'];
})[];

const getPermanentDocumentsController = controller<Dto>(async (_, { db }) => {
  const [
    documentsSnap,
    usersProfilesSnap,
    documentsRatesSnap,
    accountPermissionsSnap,
  ] = await Promise.all([
    db.collection(`docs`).get(),
    db.collection(`users-profiles`).get(),
    db.collection(`documents-rates`).get(),
    db.collection(`account-permissions`).where(`trusted`, `==`, true).get(),
  ]);

  if (accountPermissionsSnap.docs.length === 0) {
    return [];
  }

  const trustedAuthors: Record<Id, true> = {};

  accountPermissionsSnap.docs.forEach((accountPermissionSnap) => {
    trustedAuthors[accountPermissionSnap.id] = true;
  });

  const usersProfiles: Record<Id, UserProfileModel> = {};

  usersProfilesSnap.docs.forEach((userSnap) => {
    usersProfiles[userSnap.id] = userSnap.data() as UserProfileModel;
  });

  const documentsRates: Record<Id, RateModel['rating']> = {};

  documentsRatesSnap.docs.forEach((documentRateSnap) => {
    documentsRates[documentRateSnap.id] = (
      documentRateSnap.data() as RateModel
    ).rating;
  });

  const permanentDocuments: Dto = [];

  const defaultRate = createRating();

  documentsSnap.docs.forEach((documentsListSnap) => {
    const userId = documentsListSnap.id;
    const documentsListData = Object.entries(documentsListSnap.data());

    if (trustedAuthors[userId]) {
      documentsListData.forEach(
        ([documentId, document]: [Id, DocumentModel]) => {
          if (document.visibility === `permanent`) {
            permanentDocuments.push({
              ...document,
              id: documentId,
              author: usersProfiles[userId] ?? null,
              rating: documentsRates[documentId] ?? defaultRate,
            });
          }
        },
      );
    }
  });

  return permanentDocuments.sort((prev, curr) => {
    if (prev.cdate > curr.cdate) return -1;
    if (prev.cdate === curr.cdate) return 0;
    return 1;
  });
});

export { getPermanentDocumentsController };
