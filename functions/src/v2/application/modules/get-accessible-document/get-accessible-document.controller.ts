import { controller } from '@utils/controller';
import { z } from 'zod';
import { type Id, id } from '@utils/validators';
import { parse } from '@utils/parse';
import type {
  DocumentModel,
  PermanentDocumentModel,
  PublicDocumentModel,
} from '@domain/models/document';
import { errors } from '@utils/errors';
import type { UserProfileModel } from '@domain/models/user-profile';
import type { RateModel } from '@domain/models/rate';
import { createRating } from '@utils/create-rating';

const payloadSchema = z.object({
  id,
});

type SharedDtoPart = {
  id: Id;
  author: UserProfileModel | null;
  rating: RateModel['rating'];
};

type Dto =
  | (PublicDocumentModel & SharedDtoPart)
  | (Required<PermanentDocumentModel> & SharedDtoPart);

const getAccessibleDocumentController = controller<Dto>(
  async (rawPayload, { db }) => {
    const { id: documentId } = await parse(payloadSchema, rawPayload);
    const documentsSnap = await db.collection(`docs`).get();

    let foundDocumentEntry:
      | { document: PublicDocumentModel | PermanentDocumentModel; authorId: Id }
      | undefined;

    for (let i = 0; i < documentsSnap.docs.length; i++) {
      const documentsListSnap = documentsSnap.docs[i];

      const authorId = documentsListSnap.id;
      const documentsListData = documentsListSnap.data();
      const document = documentsListData[documentId] as
        | DocumentModel
        | undefined;

      if (
        document &&
        (document.visibility === `public` ||
          document.visibility === `permanent`)
      ) {
        foundDocumentEntry = {
          document,
          authorId,
        };
        break;
      }
    }

    if (!foundDocumentEntry) throw errors.notFound(`Cannot find document`);

    const [usersProfilesSnap, documentRateSnap] = await Promise.all([
      db.collection(`users-profiles`).doc(foundDocumentEntry.authorId).get(),
      db.collection(`documents-rates`).doc(documentId).get(),
    ]);

    const userProfile = usersProfilesSnap.data() as
      | UserProfileModel
      | undefined;
    const documentRate = documentRateSnap.data() as RateModel | undefined;

    const foundDocument = foundDocumentEntry.document;
    const author = userProfile ?? null;
    const defaultRating = createRating();
    const rating: RateModel['rating'] = documentRate?.rating ?? defaultRating;

    if (foundDocument.visibility === `permanent`) {
      const dto: Extract<Dto, { visibility: 'permanent' }> = {
        ...foundDocument,
        author,
        tags: foundDocument.tags ?? [],
        rating,
        id: documentId,
      };

      return dto;
    }

    const dto: Extract<Dto, { visibility: 'public' }> = {
      ...foundDocument,
      author,
      rating,
      id: documentId,
    };

    return dto;
  },
);

export { getAccessibleDocumentController };
