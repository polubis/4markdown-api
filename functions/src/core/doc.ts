import { GetDocDto } from '../dtos/docs.dto';
import { DocEntityField } from '../entities/doc.entity';
import * as admin from 'firebase-admin';
import type { Id, Name, Path } from '../entities/general';

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

Doc.createPath = (uid: Id, name: Name): Path => {
  const path = name.trim().replace(/ /g, `-`).toLowerCase();
  return `/${uid}/${path}/`;
};

export { Doc };
