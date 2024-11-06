import { DocumentsModel, type DocumentModel } from '@domain/models/document';
import { adminController } from '@utils/controller';
import { createSlug } from '@utils/create-slug';
import { Id } from '@utils/validators';

type Dto = null;

const migrateDatabaseController = adminController<Dto>(async (_, { db }) => {
  const documentsSnap = await db.collection(`docs`).get();

  const newDocuments: Record<Id, DocumentsModel> = {};

  documentsSnap.docs.forEach((documentsListSnap) => {
    const userId = documentsListSnap.id;
    const documentsListData = Object.entries(documentsListSnap.data());

    documentsListData.forEach(([documentId, document]: [Id, DocumentModel]) => {
      const path = createSlug(document.name);

      const newDocument: DocumentModel = {
        ...document,
        path,
      };

      if (
        newDocument.visibility === `permanent` &&
        (!Array.isArray(newDocument.tags) || newDocument.tags?.length === 0)
      ) {
        newDocument.tags = [`programming`];
      }

      newDocuments[userId][documentId] = newDocument;
    });
  });

  await db.runTransaction(async (transaction) => {
    Object.entries(newDocuments).map(([userId, userDocuments]) =>
      transaction.set(db.collection(`docs`).doc(userId), userDocuments),
    );
  });

  return null;
});

export { migrateDatabaseController };
