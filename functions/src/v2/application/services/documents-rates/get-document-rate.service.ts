import { collections } from '../../database/collections';
import { DocumentRateModel } from '../../../domain/models/document-rate';
import { Service } from '../../../libs/framework/service';

const getDocumentRate: Service<
  { documentId: string },
  DocumentRateModel
> = async ({ documentId, action }) => {
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
