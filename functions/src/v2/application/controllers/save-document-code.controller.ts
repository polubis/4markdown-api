import { errors } from '../../libs/framework/errors';
import { protectedController } from '../../libs/framework/controller';
import { z } from 'zod';
import { validators } from '../utils/validators';
import { parse } from '../../libs/framework/parse';
import { collections } from '../database/collections';

const commands = {
  parsePayload: async (rawPayload: unknown) => {
    const schema = z.object({
      id: validators.id,
      mdate: validators.date,
      code: z.string(),
    });

    return await parse(schema, rawPayload);
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
    const documents = await collections.documents().doc(uid).get();

    if (!documents.exists)
      throw errors.notFound(`Documents collection not found`);

    const data = documents.data();

    if (!data) throw errors.notFound(`Document data not found`);

    const doc = data[documentId];

    if (!doc) throw errors.notFound(`Document not found`);

    return doc;
  },
};

const saveDocumentCodeController = protectedController(
  async (rawPayload, { uid }) => {
    const payload = await commands.parsePayload(rawPayload);
    const document = await queries.getUserDocument({
      uid,
      documentId: payload.id,
    });
  },
);

export { saveDocumentCodeController };
