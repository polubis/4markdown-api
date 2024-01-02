import { GetDocDto } from '../dtos/docs.dto';
import { DocEntityField, DocVisibility } from '../entities/doc.entity';
import { invalidArg } from './errors';
import * as admin from 'firebase-admin';

const isValidVisibility = (visibility: string): visibility is DocVisibility => {
  const options: DocVisibility[] = [`public`, `private`, `permanent`];

  return options.includes(visibility as DocVisibility);
};

export const getVisibility = (visibility: unknown): DocVisibility | never => {
  if (typeof visibility !== `string` || !isValidVisibility(visibility))
    throw invalidArg(`Unsupported visibility value`);

  return visibility;
};

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
