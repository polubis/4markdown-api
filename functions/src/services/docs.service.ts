import { UpdateDocPayload } from '../payloads/docs.payload';
import { DocEntity } from '../entities/doc.entity';
import {
  UpdateDocPermanentDto,
  UpdateDocPrivateDto,
  UpdateDocPublicDto,
} from '../dtos/docs.dto';
import { Doc, getAllDocs } from '../core/doc';
import { Id } from '../entities/general';
import { DocsRepository } from '../repositories/docs.repository';
import { errors } from '../v2/application/utils/errors';

export const DocsService = {
  update: async (uid: Id, payload: UpdateDocPayload) => {
    const name = Doc.createName(payload.name, payload.visibility);
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
      throw errors.outOfDate(
        `You cannot edit this document. You've changed it on another device.`,
      );
    }

    if (payload.visibility === `public` || payload.visibility === `private`) {
      const alreadyExists = Object.entries(fields).some(
        ([id, field]) => id !== payload.id && field.name === name,
      );

      if (alreadyExists) {
        throw errors.exists(`Document with provided name already exist`);
      }
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

        const dto: UpdateDocPermanentDto = {
          cdate: doc.cdate,
          mdate,
          visibility: payload.visibility,
          code: payload.code,
          name,
          id: payload.id,
          path: Doc.createPath(name, payload.visibility),
          description: Doc.createDescription(payload.description),
          tags,
        };

        const alreadyExists =
          (await getAllDocs()).filter(
            (doc) =>
              doc.id !== payload.id &&
              doc.visibility === `permanent` &&
              doc.name === dto.name,
          ).length > 0;

        if (alreadyExists) {
          throw errors.exists(
            `Document with provided name already exists, please change name`,
          );
        }

        const docEntity: DocEntity = {
          [payload.id]: dto,
        };

        await docsRepo.update(docEntity);

        return dto;
      }
      default: {
        throw errors.badRequest(`Wrong visiblity value`);
      }
    }
  },
};
