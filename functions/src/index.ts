import { https } from 'firebase-functions';
import * as admin from 'firebase-admin';
import { v4 as uuid } from 'uuid';
import type {
  CreateDocPayload,
  DeleteDocPayload,
  UpdateDocPayload,
} from './payloads/docs.payload';
import type { DocEntity, DocEntityField } from './entities/doc.entity';
import type {
  CreateDocDto,
  DeleteDocDto,
  GetDocsDto,
  GetDocsDtoItem,
  UpdateDocDto,
} from './dtos/docs.dto';

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
    const cdate = new Date().toISOString();

    const field: DocEntityField = {
      name,
      code,
      cdate,
      mdate: cdate,
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

    const dto: CreateDocDto = {
      ...field,
      id,
    };

    return dto;
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

    const { id, code } = payload;
    const name = payload.name.trim();
    const mdate = new Date().toISOString();
    const fields = docs.data() as DocEntity;
    const alreadyExist = !!fields[id];

    if (!alreadyExist) {
      throw new HttpsError(
        `not-found`,
        `Operation not allowed, not found record`,
      );
    }

    await docsCollection.update(<DocEntity>{
      [id]: {
        ...fields[id],
        name,
        code,
        mdate,
      },
    });

    const dto: UpdateDocDto = {
      id,
      name,
      code,
      mdate,
      cdate: fields[id].cdate,
    };

    return dto;
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

    const result = docsCollection.data();

    if (result === undefined) {
      throw new HttpsError(
        `not-found`,
        `Operation not allowed, not found record`,
      );
    }

    const docs: GetDocsDto = Object.entries(result).map(
      ([id, field]: [string, DocEntityField]): GetDocsDtoItem => ({
        id,
        name: field.name,
        code: field.code,
        cdate: field.cdate,
        mdate: field.mdate,
      }),
    );

    return <GetDocsDto>docs;
  } catch (error: unknown) {
    if (error instanceof HttpsError) {
      if (error.code === `not-found`) {
        throw error;
      }
    }

    throw new HttpsError(`internal`, `Internal Server Error`);
  }
});

export const deleteDoc = onCall(async (payload: DeleteDocPayload, context) => {
  if (!context.auth) {
    throw new HttpsError(`unauthenticated`, `Unauthorized`);
  }

  try {
    const docsCollection = admin
      .firestore()
      .collection(`docs`)
      .doc(context.auth.uid);

    const result = (await docsCollection.get()).data();

    if (result === undefined) {
      throw new HttpsError(
        `not-found`,
        `Operation not allowed, not found record`,
      );
    }

    result[payload.id] = admin.firestore.FieldValue.delete();

    await docsCollection.update(result);

    return <DeleteDocDto>{ id: payload.id };
  } catch (error: unknown) {
    if (error instanceof HttpsError) {
      if (error.code === `not-found`) {
        throw error;
      }
    }

    throw new HttpsError(`internal`, `Internal Server Error`);
  }
});
