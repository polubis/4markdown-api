import {
  UpdateDocPayload,
  UpdateDocPermamentThumbnailUpdateAction,
} from '../payloads/docs.payload';
import { errors } from '../core/errors';
import {
  DocEntity,
  DocEntityField,
  DocThumbnail,
} from '../entities/doc.entity';
import {
  GetPermanentDocsDto,
  UpdateDocPermanentDto,
  UpdateDocPrivateDto,
  UpdateDocPublicDto,
} from '../dtos/docs.dto';
import { Doc, getAllDocs } from '../core/doc';
import { Id } from '../entities/general';
import { DocsRepository } from '../repositories/docs.repository';
import * as admin from 'firebase-admin';
import { Thumbnail } from '../core/thumbnail';
import { v4 as uuid } from 'uuid';

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
                  thumbnail: field.thumbnail,
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
  uploadThumbnail: async (
    thumbnail: UpdateDocPermamentThumbnailUpdateAction,
  ): Promise<DocThumbnail> => {
    const { extension, contentType, buffer } = Thumbnail.create(thumbnail.data);
    const storage = admin.storage();
    const bucket = storage.bucket();
    const [bucketExists] = await bucket.exists();

    if (!bucketExists) {
      throw errors.internal(`Cannot find bucket for images`);
    }

    const id = uuid();
    const location = `thumbnails/${id}`;
    const file = bucket.file(location);

    await file.save(buffer, {
      contentType,
    });

    const url = `https://firebasestorage.googleapis.com/v0/b/${
      bucket.name
    }/o/${encodeURIComponent(location)}?alt=media`;

    return {
      url,
      id,
      extension,
      contentType,
    };
  },
  update: async (uid: Id, payload: UpdateDocPayload) => {
    const name = Doc.createName(payload.name);
    const docsRepo = DocsRepository(uid);

    const docs = await docsRepo.getMy();

    if (!docs.exists) {
      throw errors.notFound();
    }

    const mdate = new Date().toISOString();
    const fields = docs.data() as DocEntity;
    const doc = fields[payload.id];

    if (!doc) {
      throw errors.notFound();
    }

    if (doc.mdate !== payload.mdate) {
      throw errors.outOfDateEntry(
        `You cannot edit this document. You've changed it on another device.`,
      );
    }

    switch (payload.visibility) {
      case `public`: {
        const dto: UpdateDocPublicDto = {
          cdate: doc.cdate,
          mdate,
          visibility: payload.visibility,
          code: payload.code,
          name,
          id: payload.id,
        };

        const docEntity: DocEntity = {
          [payload.id]: dto,
        };

        await docsRepo.update(docEntity);

        return dto;
      }
      case `private`: {
        const dto: UpdateDocPrivateDto = {
          cdate: doc.cdate,
          mdate,
          visibility: payload.visibility,
          code: payload.code,
          name,
          id: payload.id,
        };

        const docEntity: DocEntity = {
          [payload.id]: dto,
        };

        await docsRepo.update(docEntity);

        return dto;
      }
      case `permanent`: {
        const tags = Doc.createTags(payload.tags);

        const alreadyExists =
          (await getAllDocs()).filter(
            (doc) =>
              doc.id !== payload.id &&
              doc.visibility === `permanent` &&
              doc.name === name,
          ).length > 0;

        if (alreadyExists) {
          throw errors.exists(
            `Document with provided name already exists, please change name`,
          );
        }

        const thumbnail =
          doc.visibility === `permanent` ? doc.thumbnail : undefined;

        const dto: UpdateDocPermanentDto = {
          cdate: doc.cdate,
          mdate,
          visibility: payload.visibility,
          code: payload.code,
          name,
          id: payload.id,
          path: Doc.createPath(name),
          description: Doc.createDescription(payload.description),
          tags,
          thumbnail:
            payload.thumbnail.action === `noop`
              ? thumbnail
              : await DocsService.uploadThumbnail(payload.thumbnail),
        };

        const docEntity: DocEntity = {
          [payload.id]: dto,
        };

        await docsRepo.update(docEntity);

        return dto;
      }
      default: {
        throw errors.invalidArg(`Wrong visiblity value`);
      }
    }
  },
};
