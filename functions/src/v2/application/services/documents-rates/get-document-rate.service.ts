import {
  DocumentReference,
  DocumentData,
  DocumentSnapshot,
} from 'firebase-admin/firestore';
import { collections } from '../../database/collections';
import { DocumentRateModel } from '../../../domain/models/document-rate';

const getDocumentRate = async ({
  documentId,
  action,
}: {
  documentId: string;
  action?: (
    ref: DocumentReference<DocumentData>,
  ) => Promise<DocumentSnapshot<DocumentData>>;
}): Promise<{
  data: DocumentRateModel | undefined;
  ref: DocumentReference<DocumentData>;
}> => {
  const ref = collections.documentsRates().doc(documentId);
  const snap = await (action ? action(ref) : ref.get());

  if (!snap.exists) return { ref, data: undefined };

  const data = snap.data() as DocumentRateModel | undefined;

  return {
    data,
    ref,
  };
};

export { getDocumentRate };
