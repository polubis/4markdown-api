import { GetDocDto } from '../dtos/docs.dto';
import { DocEntityField } from '../entities/doc.entity';
import * as admin from 'firebase-admin';
import type { Description, Name, Path } from '../entities/general';
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
            description: field.description,
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

Doc.createPath = (name: Name): Path => {
  const path = `/${Doc.createName(name)
    .trim()
    .replace(/ /g, `-`)
    .toLowerCase()}/`;

  return path;
};

Doc.createDescription = (description: unknown): Description => {
  if (!docValidators.description(description)) {
    throw errors.invalidArg(`Wrong description format`);
  }

  return description;
};

export { Doc };
