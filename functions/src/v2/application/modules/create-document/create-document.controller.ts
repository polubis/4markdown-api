import { z } from 'zod';
import { protectedController } from '../../../libs/framework/controller';
import { validators } from '../../utils/validators';
import { parse } from '../../../libs/framework/parse';
import { nowISO, uuid } from '../../../libs/helpers/stamps';
import {
  DocumentsModel,
  PrivateDocumentModel,
} from '../../../domain/models/document';
import { collections } from '../../database/collections';
import { errors } from '../../../libs/framework/errors';

const payloadSchema = z.object({
  name: validators.document.name,
  code: validators.document.code,
});

const createDocumentController = protectedController(
  async (rawPayload, { uid }) => {
    const { code, name } = await parse(payloadSchema, rawPayload);
    const reference = collections.documents().doc(uid);
    const snapshot = await reference.get();
    const documents = snapshot.data() as DocumentsModel | undefined;

    const cdate = nowISO();
    const mdate = cdate;
    const id = uuid();

    const document: PrivateDocumentModel = {
      cdate,
      mdate,
      code,
      name,
      visibility: `private`,
    };

    const dto = {
      id,
      ...document,
    };

    if (!snapshot.exists || !documents) {
      await reference.set(<DocumentsModel>{
        [id]: document,
      });
      return dto;
    }

    const duplicated = Object.values(documents).some(
      (document) => document.name === name,
    );

    if (duplicated) {
      throw errors.exists(`Document with provided name already exist`);
    }

    await reference.update(<DocumentsModel>{
      [id]: document,
    });

    return dto;
  },
);

export { createDocumentController };
