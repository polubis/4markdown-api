import { DocumentsModel, type DocumentModel } from '@domain/models/document';
import { adminController } from '@utils/controller';
import { documentNameSchema } from '@utils/document-schemas';
import { Id } from '@utils/validators';

type Dto = null;

const migrateDatabaseController = adminController<Dto>(async (_, { db }) => {
  const documentsSnap = await db.collection(`docs`).get();

  const newDocuments: Record<Id, DocumentsModel> = {};

  documentsSnap.docs.forEach((documentsListSnap) => {
    const userId = documentsListSnap.id;
    const documentsListData = Object.entries(documentsListSnap.data());

    newDocuments[userId] = {};

    documentsListData.forEach(([documentId, document]: [Id, DocumentModel]) => {
      const name = documentNameSchema.parse(document.name);

      const newDocument: DocumentModel = {
        ...document,
        path: name.path,
      };

      if (
        newDocument.visibility === `permanent` &&
        (!Array.isArray(newDocument.tags) || newDocument.tags?.length < 1)
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
