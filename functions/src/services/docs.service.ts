import { UpdateDocPayload } from '../payloads/docs.payload';
import { errors } from '../core/errors';
import { DocEntity, DocEntityField } from '../entities/doc.entity';
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

export const DocsService = {
  getAllPermanent: async (): Promise<GetPermanentDocsDto> => {
    try {
      const allDocs = (await admin.firestore().collection(`docs`).get()).docs;

      return allDocs.reduce<GetPermanentDocsDto>((acc, doc) => {
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
            }
          },
        );

        return acc;
      }, [] as GetPermanentDocsDto);
    } catch (err) {
      throw errors.internal();
    }
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
        const dto: UpdateDocPermanentDto = {
          cdate: doc.cdate,
          mdate,
          visibility: payload.visibility,
          code: payload.code,
          name,
          id: payload.id,
          path: Doc.createPath(name),
          description: Doc.createDescription(payload.description),
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
        throw errors.invalidArg(`Wrong visiblity value`);
      }
    }
  },
};
