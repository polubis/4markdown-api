import { protectedController } from '../../utils/controller';
import { UserProfileModel } from '../../../domain/models/user-profile';
import { UserDocumentsVotesModel } from '../../../domain/models/user-documents-votes';
import { DocumentModel, DocumentsModel } from '../../../domain/models/document';

type Dto = {
  documents: Required<DocumentModel>[];
  profile: UserProfileModel | null;
  documentsVotes: UserDocumentsVotesModel;
};

const getYourInfoController = protectedController<Dto>(
  async (_, { uid, db }) => {
    const [documentsSnap, profileSnap, documentsVotesSnap] = await Promise.all([
      db.collection(`docs`).doc(uid).get(),
      db.collection(`users-profiles`).doc(uid).get(),
      db.collection(`users-documents-votes`).doc(uid).get(),
    ]);

    const documentsData =
      (documentsSnap.data() as DocumentsModel | undefined) ?? {};

    const profile =
      (profileSnap.data() as UserProfileModel | undefined) ?? null;
    const documentsVotes =
      (documentsVotesSnap.data() as UserDocumentsVotesModel | undefined) ?? {};

    const documents = Object.values(documentsData).map((document) =>
      document.visibility === `permanent`
        ? { ...document, tags: document.tags ?? [] }
        : document,
    );

    return {
      profile,
      documents,
      documentsVotes,
    };
  },
);

export { getYourInfoController };
