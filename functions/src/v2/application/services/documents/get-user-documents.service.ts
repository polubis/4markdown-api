import { DocumentsModel } from '../../../domain/models/document';
import { collections } from '../../database/collections';

const getUserDocuments = async ({
  uid,
}: {
  uid: string;
}): Promise<DocumentsModel | undefined> => {
  const ref = collections.documents().doc(uid);

  const snap = await ref.get();

  if (!snap.exists) return;

  const documents = snap.data() as DocumentsModel | undefined;

  return documents;
};

export { getUserDocuments };
