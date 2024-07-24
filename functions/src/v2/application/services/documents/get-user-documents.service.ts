import {
  DocumentReference,
  DocumentData,
  DocumentSnapshot,
} from 'firebase-admin/firestore';
import { DocumentsModel } from '../../../domain/models/document';
import { collections } from '../../database/collections';

const getUserDocuments = async ({
  uid,
  action,
}: {
  uid: string;
  action?: (
    ref: DocumentReference<DocumentData>,
  ) => Promise<DocumentSnapshot<DocumentData>>;
}): Promise<DocumentsModel | undefined> => {
  const ref = collections.documents().doc(uid);
  const snap = await (action ? action(ref) : ref.get());

  if (!snap.exists) return;

  const documents = snap.data() as DocumentsModel | undefined;

  return documents;
};

export { getUserDocuments };
