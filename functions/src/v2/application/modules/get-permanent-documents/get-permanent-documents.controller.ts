import type {
  DocumentModel,
  PermanentDocumentModel,
} from '../../../domain/models/document';
import type { UserProfileModel } from '../../../domain/models/user-profile';
import { controller } from '../../utils/controller';
import type { Id } from '../../utils/validators';

type Dto = (PermanentDocumentModel & {
  id: Id;
  author: UserProfileModel | null;
})[];

const getPermanentDocumentsController = controller<Dto>(async (_, { db }) => {
  const [documentsSnap, usersProfilesSnap] = await Promise.all([
    db.collection(`docs`).get(),
    db.collection(`users-profiles`).get(),
  ]);

  const usersProfiles: Record<Id, UserProfileModel> = {};

  usersProfilesSnap.forEach((userSnap) => {
    usersProfiles[userSnap.id] = userSnap.data() as UserProfileModel;
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
