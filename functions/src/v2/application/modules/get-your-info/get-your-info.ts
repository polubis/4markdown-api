import { protectedController } from '../../utils/controller';
import { UserDocumentsVotesModel } from '../../../domain/models/user-documents-votes';

type Dto = {
  documentsVotes: UserDocumentsVotesModel;
};

const getYourInfoController = protectedController<Dto>(
  async (_, { uid, db }) => {
    const [documentsVotesSnap] = await Promise.all([
      db.collection(`users-documents-votes`).doc(uid).get(),
    ]);

    const documentsVotes =
      (documentsVotesSnap.data() as UserDocumentsVotesModel | undefined) ?? {};

    return {
      documentsVotes,
    };
  },
);

export { getYourInfoController };
