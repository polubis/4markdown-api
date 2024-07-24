import { DocumentsModel } from '../../../domain/models/document';
import { collections } from '../../database/collections';
import { Service } from '../../../libs/framework/service';

const getUserDocuments: Service<{ uid: string }, DocumentsModel> = async ({
  uid,
  action,
}) => {
  const ref = collections.documents().doc(uid);
  const snap = await (action ? action(ref) : ref.get());

  if (!snap.exists) return { ref, data: undefined };

  const data = snap.data() as DocumentsModel | undefined;

  return {
    ref,
    data,
  };
};

export { getUserDocuments };
