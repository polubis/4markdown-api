import { https } from 'firebase-functions';
import * as admin from 'firebase-admin';
import { v4 as uuid } from 'uuid';
import type {
  CreateDocPayload,
  DeleteDocPayload,
  GetDocPayload,
  UpdateDocPayload,
} from './payloads/docs.payload';
import type { DocEntity, DocEntityField } from './entities/doc.entity';
import type {
  CreateDocDto,
  DeleteDocDto,
  GetDocDto,
  GetDocsDto,
  GetDocsDtoItem,
  UpdateDocDto,
} from './dtos/docs.dto';
import { getVisibility } from '@core/doc';
import { createPath } from '@core/path';

admin.initializeApp();

const { onCall, HttpsError } = https;

export const createDoc = onCall(async (payload: CreateDocPayload, context) => {
  if (!context.auth) {
    throw new HttpsError(`unauthenticated`, `Unauthorized`);
  }

  const { code } = payload;
  const id = uuid();
  const name = payload.name.trim();
  const cdate = new Date().toISOString();

  const field: DocEntityField = {
    name,
    code,
    cdate,
    mdate: cdate,
    visibility: `private`,
  };

  const docsCollection = admin
    .firestore()
    .collection(`docs`)
    .doc(context.auth.uid);
  const docs = await docsCollection.get();

  const dto: CreateDocDto = {
    ...field,
    id,
  };

  if (!docs.exists) {
    await docsCollection.set(<DocEntity>{
      [id]: field,
    });
    return dto;
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

  const docEntity: DocEntity = {
    ...fields,
    [id]: field,
  };

  await docsCollection.set(docEntity);

  return dto;
});

export const updateDoc = onCall(async (payload: UpdateDocPayload, context) => {
  const visibility = getVisibility(payload.visibility);

  if (!context.auth) {
    throw new HttpsError(`unauthenticated`, `Unauthorized`);
  }

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
  const doc = fields[id];
  const alreadyExist = !!doc;

  if (!alreadyExist) {
    throw new HttpsError(
      `not-found`,
      `Operation not allowed, not found record`,
    );
  }

  const { cdate } = doc;

  let docEntityField: DocEntityField;
  let dto: UpdateDocDto;

  if (visibility === `permanent`) {
    const path = createPath(name);

    const thumbnail = ``;

    docEntityField = {
      cdate,
      name,
      code,
      mdate,
      visibility,
      thumbnail,
      path,
    };
    dto = {
      id,
      name,
      code,
      mdate,
      cdate,
      visibility,
      thumbnail,
      path,
    };
  } else {
    docEntityField = {
      cdate,
      name,
      code,
      mdate,
      visibility,
    };
    dto = {
      id,
      name,
      code,
      mdate,
      cdate,
      visibility,
    };
  }

  const docEntity: DocEntity = {
    [id]: docEntityField,
  };

  await docsCollection.update(docEntity);

  return dto;
});

export const getDocs = onCall(async (_, context) => {
  if (!context.auth) {
    throw new HttpsError(`unauthenticated`, `Unauthorized`);
  }

  const docsCollection = await admin
    .firestore()
    .collection(`docs`)
    .doc(context.auth.uid)
    .get();

  const result = docsCollection.data();

  if (result === undefined) return [];

  const docs: GetDocsDto = Object.entries(result).map(
    ([id, field]: [string, DocEntityField]): GetDocsDtoItem =>
      field.visibility === `permanent`
        ? {
            id,
            name: field.name,
            code: field.code,
            cdate: field.cdate,
            mdate: field.mdate,
            visibility: field.visibility,
            thumbnail: field.thumbnail,
            path: field.path,
          }
        : {
            id,
            name: field.name,
            code: field.code,
            cdate: field.cdate,
            mdate: field.mdate,
            visibility: field.visibility,
          },
  );

  return docs;
});

export const deleteDoc = onCall(async (payload: DeleteDocPayload, context) => {
  if (!context.auth) {
    throw new HttpsError(`unauthenticated`, `Unauthorized`);
  }

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

  const dto: DeleteDocDto = { id: payload.id };

  return dto;
});

export const deleteAccount = onCall(async (_, context) => {
  if (!context.auth) {
    throw new HttpsError(`unauthenticated`, `Unauthorized`);
  }

  await admin.auth().deleteUser(context.auth.uid);
  await admin.firestore().collection(`docs`).doc(context.auth.uid).delete();
  return null;
});

export const getPublicDoc = onCall(async (payload: GetDocPayload) => {
  const docs = (await admin.firestore().collection(`docs`).get()).docs.map(
    (doc) => doc.data(),
  );
  let docDto: GetDocDto | undefined;

  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    const field: DocEntityField = doc[payload.id];

    if (field) {
      if (field.visibility === `permanent`) {
        docDto = {
          id: payload.id,
          name: field.name,
          cdate: field.cdate,
          mdate: field.mdate,
          code: field.code,
          visibility: field.visibility,
          thumbnail: field.thumbnail,
          path: field.path,
        };
      } else {
        docDto = {
          id: payload.id,
          name: field.name,
          cdate: field.cdate,
          mdate: field.mdate,
          code: field.code,
          visibility: field.visibility,
        };
      }

      break;
    }
  }

  if (docDto?.visibility !== `public` && docDto?.visibility !== `permanent`) {
    throw new HttpsError(`not-found`, `Not found`);
  }

  return docDto;
});
