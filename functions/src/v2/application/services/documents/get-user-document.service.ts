import { DocumentModel } from '../../../domain/models/document';
import { getUserDocuments } from './get-user-documents.service';
import {
  DocumentReference,
  DocumentData,
  DocumentSnapshot,
} from 'firebase-admin/firestore';

const getUserDocument = async ({
  uid,
  documentId,
  action,
}: {
  uid: string;
  documentId: string;
  action?: (
    ref: DocumentReference<DocumentData>,
  ) => Promise<DocumentSnapshot<DocumentData>>;
}): Promise<DocumentModel | undefined> => {
  const documents = await getUserDocuments({ uid, action });

  if (!documents) return;

  const document = documents[documentId] as DocumentModel | undefined;

  return document;
};

export { getUserDocument };
