import { DocumentModel } from '../../../domain/models/document';
import { getUserDocuments } from './get-user-documents.service';

const getUserDocument = async ({
  uid,
  documentId,
}: {
  uid: string;
  documentId: string;
}): Promise<DocumentModel | undefined> => {
  const documents = await getUserDocuments({ uid });

  if (!documents) return;

  const document = documents[documentId] as DocumentModel | undefined;

  return document;
};

export { getUserDocument };
