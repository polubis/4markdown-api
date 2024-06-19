import { errors } from '../../libs/framework/errors';
import { protectedController } from '../../libs/framework/controller';
import { z } from 'zod';
import { validators } from '../utils/validators';
import { parse } from '../../libs/framework/parse';
import { collections } from '../database/collections';
import {
  DocumentModel,
  DocumentObjectModel,
} from '../../domain/models/document';

const payloadSchema = z.object({
  id: validators.id,
  mdate: validators.date,
  code: z.string(),
});

type Payload = z.infer<typeof payloadSchema>;

const commands = {
  parsePayload: (rawPayload: unknown) => parse(payloadSchema, rawPayload),
  updateDocument: async ({
    uid,
    payload,
    documentObject,
  }: {
    uid: string;
    payload: Payload;
    documentObject: DocumentObjectModel;
  }) => {
    if (payload.mdate !== documentObject.mdate) {
      throw errors.outOfDate(`The document has been already changed`);
    }

    await collections
      .documents()
      .doc(uid)
      .update({
        [payload.id]: {
          ...documentObject,
          code: payload.code,
        },
      });
  },
};

const queries = {
  getUserDocument: async (uid: string, documentId: string) => {
    const snapshot = await collections.documents().doc(uid).get();

    if (!snapshot.exists)
      throw errors.notFound(`Documents collection not found`);

    const data = snapshot.data() as DocumentModel | undefined;

    if (!data) throw errors.notFound(`Document data not found`);

    const document = data[documentId] as DocumentObjectModel | undefined;

    if (!document) throw errors.notFound(`Document not found`);

    return document;
  },
};

const saveDocumentCodeController = protectedController(
  async (rawPayload, { uid }) => {
    const payload = await commands.parsePayload(rawPayload);
    const document = await queries.getUserDocument(uid, payload.id);
    await commands.updateDocument({
      uid,
      payload,
      documentObject: document,
    });
  },
);

export { saveDocumentCodeController };
