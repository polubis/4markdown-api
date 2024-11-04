import { protectedController } from '@utils/controller';
import type {
  DocumentsModel,
  PermanentDocumentModel,
  PrivateDocumentModel,
  PublicDocumentModel,
} from '@domain/models/document';
import { type Id } from '@utils/validators';

type Dto = ((
  | PrivateDocumentModel
  | PublicDocumentModel
  | (Omit<PermanentDocumentModel, 'tags'> & { tags: string[] })
) & { id: Id })[];

const getYourDocumentsController = protectedController<Dto>(
  async (_, { uid, db }) => {
    const documentsSnap = await db.collection(`docs`).doc(uid).get();
    const documents = documentsSnap.data() as DocumentsModel | undefined;

    if (!documents) return [];

    return Object.entries(documents)
      .map<Dto[number]>(([documentId, document]) => {
        if (document.visibility === `permanent`) {
          return {
            id: documentId,
            name: document.name,
            cdate: document.cdate,
            mdate: document.mdate,
            visibility: document.visibility,
            description: document.description,
            tags: document.tags ?? [],
            path: document.path,
            code: document.code,
          };
        }

        return {
          id: documentId,
          name: document.name,
          cdate: document.cdate,
          mdate: document.mdate,
          visibility: document.visibility,
          code: document.code,
        };
      })
      .sort((prev, curr) => {
        if (prev.mdate > curr.mdate) return -1;
        if (prev.mdate === curr.mdate) return 0;
        return 1;
      });
  },
);

export { getYourDocumentsController };
