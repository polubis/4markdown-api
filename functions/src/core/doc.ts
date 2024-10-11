import { GetDocDto } from '../dtos/docs.dto';
import { DocEntityField, DocVisibility } from '../entities/doc.entity';
import * as admin from 'firebase-admin';
import type { Description, Name, Path, Tags } from '../entities/general';
import { docValidators } from '../validation/doc';
import { errors } from '../v2/application/utils/errors';

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
            tags: field.tags ?? [],
            author: null,
          });

          return;
        }

        if (field.visibility === `public`) {
          acc.push({
            id,
            cdate: field.cdate,
            mdate: field.mdate,
            code: field.code,
            name: field.name,
            visibility: field.visibility,
            author: null,
          });

          return;
        }

        if (field.visibility === `private`) {
          acc.push({
            id,
            cdate: field.cdate,
            mdate: field.mdate,
            code: field.code,
            name: field.name,
            visibility: field.visibility,
          });

          return;
        }

        throw errors.internal(`Invalid document visibility`);
      },
    );

    return acc;
  }, [] as GetDocDto[]);

  return flattenDocs;
};

const Doc = () => {};

Doc.createName = (name: unknown, visibility: DocVisibility): Name => {
  if (!docValidators.name(name)) {
    throw errors.badRequest(`Wrong name format`);
  }

  if (visibility === `permanent`) {
    const hasAtLeast3Words = name.trim().split(` `).length >= 3;

    if (!hasAtLeast3Words) {
      throw errors.badRequest(`At least 3 words in name are required`);
    }
  }

  return name;
};

Doc.createPath = (name: Name, visibility: DocVisibility): Path => {
  const path = `/${Doc.createName(name, visibility)
    .trim()
    .replace(/ /g, `-`)
    .toLowerCase()}/`;

  return path;
};

Doc.createDescription = (description: unknown): Description => {
  if (!docValidators.description(description)) {
    throw errors.badRequest(`Wrong description format`);
  }

  return description;
};

Doc.createTags = (tags: unknown): Tags => {
  if (!docValidators.tags(tags)) {
    throw errors.badRequest(`Wrong description format`);
  }

  return tags;
};

export { Doc };
