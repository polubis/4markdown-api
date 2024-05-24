import { errors } from '../core/errors';
import { DocEntityField } from '../entities/doc.entity';
import { GetPermanentDocsDto } from '../dtos/docs.dto';
import * as admin from 'firebase-admin';

export const DocsService = {
  getAllPermanent: async (): Promise<GetPermanentDocsDto> => {
    try {
      const allDocs = (await admin.firestore().collection(`docs`).get()).docs;

      return allDocs
        .reduce<GetPermanentDocsDto>((acc, doc) => {
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
                  tags: field.tags ?? [],
                });
              }
            },
          );

          return acc;
        }, [] as GetPermanentDocsDto)
        .sort((prev, curr) => {
          if (prev.cdate > curr.cdate) return -1;
          if (prev.cdate === curr.cdate) return 0;
          return 1;
        });
    } catch (err) {
      throw errors.internal(`Server error`);
    }
  },
};
