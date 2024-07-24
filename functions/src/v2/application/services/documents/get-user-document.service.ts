import { DocumentModel } from '../../../domain/models/document';
import { Service } from '../../../libs/framework/service';
import { getUserDocuments } from './get-user-documents.service';

const getUserDocument: Service<
  { uid: string; documentId: string },
  DocumentModel
> = async ({ uid, documentId, action }) => {
  const documents = await getUserDocuments({ uid, action });

  if (!documents.data) return { ref: documents.ref, data: undefined };

  const data = documents.data[documentId] as DocumentModel | undefined;

  return {
    ref: documents.ref,
    data,
  };
};

export { getUserDocument };
