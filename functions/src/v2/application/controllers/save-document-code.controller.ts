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
  updateDocument: async (
    payload: Payload,
    documentObject: DocumentObjectModel,
  ) => {
    if (payload.mdate !== documentObject.mdate) {
      throw errors.outOfDate(`The document has been already changed`);
    }
  },
};

const queries = {
  getUserDocument: async ({
    uid,
    documentId,
  }: {
    uid: string;
    documentId: string;
  }) => {
    const documentsRecord = await collections.documents().doc(uid).get();

    if (!documentsRecord.exists)
      throw errors.notFound(`Documents collection not found`);

    const documentModel = documentsRecord.data() as DocumentModel | undefined;

    if (!documentModel) throw errors.notFound(`Document data not found`);

    const document = documentModel[documentId] as
      | DocumentObjectModel
      | undefined;

    if (!document) throw errors.notFound(`Document not found`);

    return document;
  },
};

const saveDocumentCodeController = protectedController(
  async (rawPayload, { uid }) => {
    const payload = await commands.parsePayload(rawPayload);
    const document = await queries.getUserDocument({
      uid,
      documentId: payload.id,
    });
    await commands.updateDocument(payload, document);
  },
);

export { saveDocumentCodeController };
