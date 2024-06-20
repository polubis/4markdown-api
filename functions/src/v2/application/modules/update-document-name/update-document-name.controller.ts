import { errors } from '../../../libs/framework/errors';
import { protectedController } from '../../../libs/framework/controller';
import { z } from 'zod';
import { validators } from '../../utils/validators';
import { parse } from '../../../libs/framework/parse';
import { collections } from '../../database/collections';
import { DocumentModel, DocumentsModel } from '../../../domain/models/document';

const payloadSchema = z.object({
  id: validators.id,
  mdate: validators.date,
  name: validators.document.name,
});

type Payload = z.infer<typeof payloadSchema>;

const commands = {
  parsePayload: (rawPayload: unknown) => parse(payloadSchema, rawPayload),
  updateDocument: async ({
    uid,
    payload,
    documents,
  }: {
    uid: string;
    payload: Payload;
    documents: DocumentsModel;
  }) => {
    const document = documents[payload.id] as DocumentModel | undefined;

    if (!document) {
      throw errors.notFound(`Document not found`);
    }

    if (payload.mdate !== document.mdate) {
      throw errors.outOfDate(`The document has been already changed`);
    }

    if (document.visibility === `permanent`) {
      const hasAtLeast3Words = payload.name.trim().split(` `).length >= 3;

      if (!hasAtLeast3Words) {
        throw errors.badRequest(`At least 3 words in name are required`);
      }
    }

    if (document.visibility === `permanent`) {
      // TODO
    } else {
      const alreadyExists = Object.entries(documents).some(
        ([id, document]) => id !== payload.id && document.name === payload.name,
      );

      if (alreadyExists) {
        throw errors.exists(`Document with provided name exists`);
      }
    }

    await collections
      .documents()
      .doc(uid)
      .update({
        [payload.id]: {
          ...document,
          name: payload.name,
        },
      });
  },
};

const queries = {
  getUserDocuments: async (uid: string) => {
    const snapshot = await collections.documents().doc(uid).get();

    if (!snapshot.exists)
      throw errors.notFound(`Documents collection not found`);

    const documents = snapshot.data() as DocumentsModel | undefined;

    if (!documents) throw errors.notFound(`Document data not found`);

    return documents;
  },
};

const updateDocumentNameController = protectedController(
  async (rawPayload, { uid }) => {
    const payload = await commands.parsePayload(rawPayload);
    const documents = await queries.getUserDocuments(uid);
    await commands.updateDocument({
      uid,
      payload,
      documents,
    });
  },
);

export { updateDocumentNameController };
