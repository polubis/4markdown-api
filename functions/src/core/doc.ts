import { GetDocDto } from '../dtos/docs.dto';
import { DocEntityField } from '../entities/doc.entity';
import * as admin from 'firebase-admin';
import type { Id, Name, Path } from '../entities/general';
import { docValidators } from '../validation/doc';
import { errors } from './errors';

export const getAllDocs = async () => {
  const allDocs = (await admin.firestore().collection(`docs`).get()).docs;
  const flattenDocs = allDocs.reduce<GetDocDto[]>((acc, doc) => {
    Object.entries(doc.data()).forEach(
      ([id, field]: [string, DocEntityField]) => {
        if (field.visibility === `permanent`) {
          acc.push({
            id,
            cdate: field.cdate,
            mdate: field.mdate,
            code: field.code,
            name: field.name,
            visibility: field.visibility,
            thumbnail: field.thumbnail,
            path: field.path,
          });
        } else {
          acc.push({
            id,
            cdate: field.cdate,
            mdate: field.mdate,
            code: field.code,
            name: field.name,
            visibility: field.visibility,
          });
        }
      },
    );

    return acc;
  }, [] as GetDocDto[]);

  return flattenDocs;
};

const Doc = () => {};

Doc.createName = (name: unknown): Name => {
  if (!docValidators.name(name)) {
    throw errors.invalidArg(`Wrong name format`);
  }

  return name;
};

Doc.createPath = (uid: Id, name: Name): Path => {
  if (!docValidators.path(name)) {
    throw errors.invalidArg(`Wrong name format`);
  }

  const path = Doc.createName(name).trim().replace(/ /g, `-`).toLowerCase();
  return `/${uid}/${path}/`;
};

export { Doc };
