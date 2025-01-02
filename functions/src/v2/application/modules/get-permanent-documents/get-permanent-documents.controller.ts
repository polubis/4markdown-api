import type {
  DocumentModel,
  PermanentDocumentModel,
} from '@domain/models/document';
import { DocumentCommentModel } from '@domain/models/document-comment';
import { RateModel } from '@domain/models/rate';
import type { UserProfileModel } from '@domain/models/user-profile';
import { controller } from '@utils/controller';
import { createRating } from '@utils/create-rating';
import type { Id } from '@utils/validators';

type GetPermanentDocumentsDto = (Required<PermanentDocumentModel> & {
  id: Id;
  author: UserProfileModel | null;
  authorId: Id;
  commentsCount: number;
  rating: RateModel['rating'];
})[];

const DEFAULT_RATE = createRating();

const getPermanentDocumentsController = controller<GetPermanentDocumentsDto>(
  async (_, { db }) => {
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

    const permanentDocuments: Omit<
      GetPermanentDocumentsDto[number],
      'commentsCount'
    >[] = [];

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
                authorId: userId,
                author: usersProfiles[userId] ?? null,
                rating: documentsRates[documentId] ?? DEFAULT_RATE,
              });
            }
          },
        );
      }
    });

    const countedDocumentComments = (
      await db
        .collection(`document-comments`)
        .where(
          `documentId`,
          `in`,
          permanentDocuments.map((document) => document.id),
        )
        .get()
    ).docs.reduce<Record<Id, number>>((acc, { data }) => {
      const comment = data() as DocumentCommentModel;

      acc[comment.documentId] = (acc[comment.documentId] ?? 0) + 1;
      return acc;
    }, {});

    return permanentDocuments
      .map((document) => ({
        ...document,
        commentsCount: countedDocumentComments[document.id] ?? 0,
      }))
      .sort((prev, curr) => {
        if (prev.cdate > curr.cdate) return -1;
        if (prev.cdate === curr.cdate) return 0;
        return 1;
      });
  },
);

export { getPermanentDocumentsController };
