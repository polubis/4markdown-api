import { https } from 'firebase-functions';
import * as admin from 'firebase-admin';
import { v4 as uuid } from 'uuid';
import type { CreatePayload } from './payloads/create-doc.payload';
import type { DocEntity, DocEntityField } from './entities/doc.entity';
import type { CreateDocDto } from './dtos/create-doc.dto';

admin.initializeApp();

const { onCall, HttpsError } = https;

export const createDoc = onCall(async (payload: CreatePayload, context) => {
  if (!context.auth) {
    throw new HttpsError(`unauthenticated`, `Unauthorized`);
  }

  try {
    const { code } = payload;
    const id = uuid();
    const name = payload.name.trim();

    const doc: DocEntityField = {
      id,
      name,
      code,
    };

    const docsCollection = admin
      .firestore()
      .collection(`docs`)
      .doc(context.auth.uid);
    const docs = await docsCollection.get();

    if (!docs.exists) {
      await docsCollection.set({
        fields: [doc],
      });
      return <CreateDocDto>{ id };
    }

    const fields = (docs.data() as DocEntity).fields;
    const alreadyExist = fields.some(
      (f) => f.name.trim().toLowerCase() === doc.name.toLowerCase(),
    );

    if (alreadyExist) {
      throw new HttpsError(
        `already-exists`,
        `Document with provided name already exist`,
      );
    }

    await docsCollection.set(
      {
        fields: [...fields, doc],
      },
      { merge: true },
    );

    return <CreateDocDto>{ id };
  } catch (error: unknown) {
    if (error instanceof HttpsError) {
      if (error.code === `already-exists`) {
        throw error;
      }
    }

    throw new HttpsError(`internal`, `Internal Server Error`);
  }
});
