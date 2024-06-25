import { z } from 'zod';
import { protectedController } from '../../../libs/framework/controller';
import { validators } from '../../utils/validators';
import { parse } from '../../../libs/framework/parse';
import { collections } from '../../database/collections';
import { errors } from '../../../libs/framework/errors';
import { DocumentsModel } from '../../../domain/models/document';
import * as admin from 'firebase-admin';

const payloadSchema = z.object({
  id: validators.id,
});

type Payload = z.infer<typeof payloadSchema>;

const getUserDocuments = async (uid: string) => {
  const snapshot = await collections.documents().doc(uid).get();

  if (!snapshot.exists) throw errors.notFound(`Documents collection not found`);

  const documents = snapshot.data() as DocumentsModel | undefined;

  if (!documents) throw errors.notFound(`Document data not found`);

  return documents;
};

const deleteUserDocument = async (
  documents: DocumentsModel,
  payload: Payload,
  uid: string,
) => {
  (documents as admin.firestore.DocumentData)[payload.id] =
    admin.firestore.FieldValue.delete();

  await collections.documents().doc(uid).update(documents);
};

const deleteDocumentController = protectedController(
  async (rawPayload, { uid }) => {
    const payload = await parse(payloadSchema, rawPayload);
    const documents = await getUserDocuments(uid);
    await deleteUserDocument(documents, payload, uid);
  },
);

export { deleteDocumentController };
