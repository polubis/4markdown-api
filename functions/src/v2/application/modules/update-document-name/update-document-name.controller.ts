import { errors } from '../../utils/errors';
import { protectedController } from '../../utils/controller';
import { z } from 'zod';
import { type Date, validators } from '../../utils/validators';
import { parse } from '../../utils/parse';
import type {
  DocumentModel,
  DocumentsModel,
} from '../../../domain/models/document';
import { nowISO } from '../../../libs/helpers/stamps';
import { DBInstance } from '../../database/database';

const payloadSchema = z.object({
  id: validators.id,
  mdate: validators.date,
  name: validators.document.name,
});

type Payload = z.infer<typeof payloadSchema>;

type Dto = {
  mdate: Date;
};

const containsDuplicateInAccessibleDocuments = async (
  payload: Payload,
  db: DBInstance,
): Promise<boolean> => {
  const allDocumentsSnap = (await db.collection(`docs`).get()).docs;

  for (const userDocumentsSnap of allDocumentsSnap) {
    const userDocuments = userDocumentsSnap.data() as DocumentsModel;

    const hasDuplicate = Object.entries(userDocuments).some(
      ([documentId, document]) =>
        documentId !== payload.id &&
        document.visibility === `permanent` &&
        document.name === payload.name,
    );

    if (hasDuplicate) return true;
  }

  return false;
};

const updateDocumentNameController = protectedController<Dto>(
  async (rawPayload, { uid, db }) => {
    const userDocumentsRef = db.collection(`docs`).doc(uid);
    const [payload, userDocumentsSnap] = await Promise.all([
      parse(payloadSchema, rawPayload),
      userDocumentsRef.get(),
    ]);
    const userDocuments = userDocumentsSnap.data() as
      | DocumentsModel
      | undefined;

    if (!userDocuments) throw errors.notFound(`Document data not found`);

    const userDocument = userDocuments[payload.id] as DocumentModel | undefined;

    if (!userDocument) {
      throw errors.notFound(`Document not found`);
    }

    if (payload.mdate !== userDocument.mdate) {
      throw errors.outOfDate(`The document has been already changed`);
    }

    const hasDuplicateInOwnDocuments = Object.entries(userDocuments).some(
      ([id, document]) => id !== payload.id && document.name === payload.name,
    );

    if (
      hasDuplicateInOwnDocuments ||
      (userDocument.visibility === `permanent` &&
        (await containsDuplicateInAccessibleDocuments(payload, db)))
    ) {
      throw errors.exists(
        `Document with provided name already exists, please change name`,
      );
    }

    const mdate = nowISO();

    await userDocumentsRef.update(<DocumentsModel>{
      [payload.id]: {
        ...userDocument,
        name: payload.name,
        mdate,
      },
    });

    return { mdate };
  },
);

export { updateDocumentNameController };
