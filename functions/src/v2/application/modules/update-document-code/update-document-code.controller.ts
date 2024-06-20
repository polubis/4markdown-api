import { errors } from '../../../libs/framework/errors';
import { protectedController } from '../../../libs/framework/controller';
import { z } from 'zod';
import { validators } from '../../utils/validators';
import { parse } from '../../../libs/framework/parse';
import { collections } from '../../database/collections';
import {
  DocumentModel,
  DocumentModelValue,
} from '../../../domain/models/document';

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
    value,
  }: {
    uid: string;
    payload: Payload;
    value: DocumentModelValue;
  }) => {
    if (payload.mdate !== value.mdate) {
      throw errors.outOfDate(`The document has been already changed`);
    }

    await collections
      .documents()
      .doc(uid)
      .update({
        [payload.id]: {
          ...value,
          code: payload.code,
        },
      });
  },
};

const queries = {
  getUserDocument: async (uid: string, payload: Payload) => {
    const snapshot = await collections.documents().doc(uid).get();

    if (!snapshot.exists)
      throw errors.notFound(`Documents collection not found`);

    const data = snapshot.data() as DocumentModel | undefined;

    if (!data) throw errors.notFound(`Document data not found`);

    const value = data[payload.id] as DocumentModelValue | undefined;

    if (!value) throw errors.notFound(`Document not found`);

    return value;
  },
};

const updateDocumentCodeController = protectedController(
  async (rawPayload, { uid }) => {
    const payload = await commands.parsePayload(rawPayload);
    const value = await queries.getUserDocument(uid, payload);
    await commands.updateDocument({
      uid,
      payload,
      value,
    });
  },
);

export { updateDocumentCodeController };
