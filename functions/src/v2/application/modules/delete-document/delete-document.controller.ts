import { z } from 'zod';
import { protectedController } from '../../../libs/framework/controller';
import { validators } from '../../utils/validators';
import { parse } from '../../../libs/framework/parse';
import { collections } from '../../database/collections';
import { errors } from '../../../libs/framework/errors';
import { DocumentsModel } from '../../../domain/models/document';
import * as admin from 'firebase-admin';
import { DocumentData, DocumentReference } from 'firebase-admin/firestore';

const payloadSchema = z.object({
  id: validators.id,
});

type Payload = z.infer<typeof payloadSchema>;

const getUserDocuments = async (ref: DocumentReference<DocumentData>) => {
  const snapshot = await ref.get();

  if (!snapshot.exists) throw errors.notFound(`Documents collection not found`);

  const documents = snapshot.data() as DocumentsModel | undefined;

  if (!documents) throw errors.notFound(`Document data not found`);

  return documents;
};

const deleteUserDocument = async (
  documents: DocumentsModel,
  payload: Payload,
  ref: DocumentReference<DocumentData>,
) => {
  (documents as admin.firestore.DocumentData)[payload.id] =
    admin.firestore.FieldValue.delete();

  await ref.update(documents);
};

const deleteDocumentController = protectedController(
  async (rawPayload, { uid }) => {
    const ref = collections.documents().doc(uid);
    const [payload, documents] = await Promise.all([
      parse(payloadSchema, rawPayload),
      getUserDocuments(ref),
    ]);

    await deleteUserDocument(documents, payload, ref);
  },
);

export { deleteDocumentController };
