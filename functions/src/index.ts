import { https } from 'firebase-functions';
import * as admin from 'firebase-admin';
import { v4 as uuid } from 'uuid';
import type {
  CreateDocPayload,
  UpdateDocPayload,
} from './payloads/create-doc.payload';
import type { DocEntity, DocEntityField } from './entities/doc.entity';
import type { CreateDocDto, UpdateDocDto } from './dtos/create-doc.dto';

admin.initializeApp();

const { onCall, HttpsError } = https;

export const createDoc = onCall(async (payload: CreateDocPayload, context) => {
  if (!context.auth) {
    throw new HttpsError(`unauthenticated`, `Unauthorized`);
  }

  try {
    const { code } = payload;
    const id = uuid();
    const name = payload.name.trim();

    const field: DocEntityField = {
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
        fields: { [id]: field },
      });
      return <CreateDocDto>{ id };
    }

    const fields = docs.data() as DocEntity;
    const alreadyExist = fields[id]!!;

    if (alreadyExist) {
      throw new HttpsError(
        `already-exists`,
        `Document with provided name already exist`,
      );
    }

    await docsCollection.set({
      fields: {
        ...fields,
        [id]: field,
      },
    });

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

export const updateDoc = onCall(async (payload: UpdateDocPayload, context) => {
  if (!context.auth) {
    throw new HttpsError(`unauthenticated`, `Unauthorized`);
  }

  try {
    const { id, code } = payload;
    const name = payload.name.trim();

    const field: DocEntityField = {
      name,
      code,
    };

    const docsCollection = admin
      .firestore()
      .collection(`docs`)
      .doc(context.auth.uid);
    const docs = await docsCollection.get();

    if (!docs.exists) {
      throw new HttpsError(
        `not-found`,
        `Operation not allowed, not found record`,
      );
    }

    const fields = docs.data() as DocEntity;

    await docsCollection.set({
      ...fields,
      [id]: field,
    });

    return <UpdateDocDto>{ id };
  } catch (error: unknown) {
    if (error instanceof HttpsError) {
      if (error.code === `not-found`) {
        throw error;
      }
    }

    throw new HttpsError(`internal`, `Internal Server Error`);
  }
});
