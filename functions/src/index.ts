import { https } from 'firebase-functions';
import * as admin from 'firebase-admin';
import { v4 as uuid } from 'uuid';
import type {
  CreateDocPayload,
  UpdateDocPayload,
} from './payloads/docs.payload';
import type { DocEntity, DocEntityField } from './entities/doc.entity';
import type { CreateDocDto, GetDocsDto, UpdateDocDto } from './dtos/docs.dto';

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
      await docsCollection.set(<DocEntity>{
        [id]: field,
      });
      return <CreateDocDto>{ id };
    }

    const fields = docs.data() as DocEntity;
    const alreadyExist = Object.values(fields).some(
      (f) => f.name.trim().toLowerCase() === payload.name.toLowerCase(),
    );

    if (alreadyExist) {
      throw new HttpsError(
        `already-exists`,
        `Document with provided name already exist`,
      );
    }

    await docsCollection.set(<DocEntity>{
      ...fields,
      [id]: field,
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
    const alreadyExist = !!fields[id];

    if (!alreadyExist) {
      throw new HttpsError(
        `not-found`,
        `Operation not allowed, not found record`,
      );
    }

    await docsCollection.update(<DocEntity>{
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

export const getDocs = onCall(async (_, context) => {
  if (!context.auth) {
    throw new HttpsError(`unauthenticated`, `Unauthorized`);
  }

  try {
    const docsCollection = await admin
      .firestore()
      .collection(`docs`)
      .doc(context.auth.uid)
      .get();

    const docs: GetDocsDto = Object.entries(docsCollection.data).map(
      ([id, field]) => ({
        id,
        ...field,
      }),
    );

    return <GetDocsDto>docs;
  } catch (error: unknown) {
    throw new HttpsError(`internal`, `Internal Server Error`);
  }
});
