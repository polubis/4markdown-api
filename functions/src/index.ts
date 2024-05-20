import { https } from 'firebase-functions';
import * as admin from 'firebase-admin';
import { v4 as uuid } from 'uuid';
import type {
  CreateDocPayload,
  DeleteDocPayload,
  GetDocPayload,
} from './payloads/docs.payload';
import type { DocEntity, DocEntityField } from './entities/doc.entity';
import type {
  CreateDocDto,
  DeleteDocDto,
  GetDocDto,
  GetDocsDto,
  GetDocsDtoItem,
} from './dtos/docs.dto';
import { errors } from './core/errors';
import { Doc } from './core/doc';
import { DocsService } from './services/docs.service';
import { AuthService } from './services/auth.service';
import { UsersService } from './services/users.service';
import { UploadImagePayload } from './payloads/images.payload';
import { UsersProfilesService } from './services/users-profiles.service';

admin.initializeApp();

const { onCall, HttpsError } = https;

export const createDoc = onCall(async (payload: CreateDocPayload, context) => {
  if (!context.auth) {
    throw new HttpsError(`unauthenticated`, `Unauthorized`);
  }

  const { code } = payload;
  const id = uuid();
  const cdate = new Date().toISOString();

  const field: DocEntityField = {
    name: Doc.createName(payload.name, `private`),
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
  const alreadyExist = Object.values(fields).some((f) => f.name === field.name);

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

export const updateDoc = onCall(async (payload, context) => {
  const user = AuthService.authorize(context);
  return DocsService.update(user.uid, payload);
});

export const getDocs = onCall(async (_, context) => {
  if (!context.auth) {
    throw errors.notAuthorized();
  }

  const docsCollection = await admin
    .firestore()
    .collection(`docs`)
    .doc(context.auth.uid)
    .get();

  const result = docsCollection.data();

  if (result === undefined) return [];

  const docs: GetDocsDto = Object.entries(result)
    .map(
      ([id, field]: [string, DocEntityField]): GetDocsDtoItem =>
        field.visibility === `permanent`
          ? {
              id,
              name: field.name,
              code: field.code,
              cdate: field.cdate,
              mdate: field.mdate,
              visibility: field.visibility,
              description: field.description,
              path: field.path,
              tags: field.tags ?? [],
            }
          : {
              id,
              name: field.name,
              code: field.code,
              cdate: field.cdate,
              mdate: field.mdate,
              visibility: field.visibility,
            },
    )
    .sort((prev, curr) => {
      if (prev.mdate > curr.mdate) return -1;
      if (prev.mdate === curr.mdate) return 0;
      return 1;
    });

  return docs;
});

export const deleteDoc = onCall(async (payload: DeleteDocPayload, context) => {
  if (!context.auth) {
    throw errors.notAuthorized();
  }

  const docsCollection = admin
    .firestore()
    .collection(`docs`)
    .doc(context.auth.uid);

  const result = (await docsCollection.get()).data();

  if (result === undefined) {
    throw errors.notFound();
  }

  result[payload.id] = admin.firestore.FieldValue.delete();

  await docsCollection.update(result);

  const dto: DeleteDocDto = { id: payload.id };

  return dto;
});

export const deleteAccount = onCall(async (_, context) => {
  if (!context.auth) {
    throw errors.notAuthorized();
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
          description: field.description,
          path: field.path,
          tags: field.tags ?? [],
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
    throw errors.notFound();
  }

  return docDto;
});

export const getPermanentDocs = onCall(async () => {
  return await DocsService.getAllPermanent();
});

export const uploadImage = onCall(
  async (payload: UploadImagePayload, context) => {
    return await UsersService.uploadImage(payload, context);
  },
);

export const updateYourUserProfile = onCall(
  async (payload: unknown, context) => {
    return await UsersProfilesService.updateYour(payload, context);
  },
);

export const getYourUserProfile = onCall(async (_, context) => {
  return await UsersProfilesService.getYour(context);
});
