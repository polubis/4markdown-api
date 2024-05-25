import { errors } from '../../libs/framework/errors';
import { nowISO } from '../../libs/utils/date';
import { pick } from '../../libs/utils/pick';
import {
  IDocEntity,
  IPrivateDocEntityField,
  IPublicDocEntityField,
  IPermanentDocEntityField,
} from '../shared/entities/defs';
import {
  DocEntity,
  PermamentDocEntityField,
} from '../shared/entities/doc.entity';
import { IDocsRepository } from '../shared/repositories/defs';
import { DocsRepository } from '../shared/repositories/docs.repository';
import {
  IUpdateDocService,
  IUpdatePermamentDocDto,
  IUpdatePermanentDocPayload,
  IUpdatePrivateDocDto,
  IUpdatePublicDocDto,
} from './defs';

const isDuplicated = async (
  docsRepository: IDocsRepository,
  payload: IUpdatePermanentDocPayload,
): Promise<boolean> => {
  const collection = await docsRepository.getCollection();

  for (const item of collection) {
    const entity = item.data();

    for (const fieldId in entity) {
      const field = entity[fieldId];

      if (
        fieldId !== payload.id &&
        field.visibility === payload.visibility &&
        field.name === payload.name
      )
        return true;
    }
  }

  return false;
};

const UpdateDocService: IUpdateDocService = {
  update: async (uid, payload) => {
    const docsRepository = DocsRepository();
    const docEntity = await docsRepository.getEntity(uid);

    if (!docEntity)
      throw errors.notFound(
        `NOT_FOUND_RECORD`,
        `Cannot find provided document`,
      );

    const doc = docEntity[payload.id];

    if (!doc)
      throw errors.notFound(
        `NOT_FOUND_RECORD`,
        `Cannot find provided document`,
      );

    if (doc.mdate !== payload.mdate) {
      throw errors.resourceExhausted(
        `NOT_UP_TO_DATE_ENTRY`,
        `You cannot edit this document. You've changed it on another device.`,
      );
    }

    const now = nowISO();

    if (payload.visibility === `private`) {
      const field: IPrivateDocEntityField = {
        mdate: now,
        ...pick(doc, `cdate`),
        ...pick(payload, `visibility`, `name`, `code`),
      };
      const entity: IDocEntity = {
        [payload.id]: field,
      };
      const dto: IUpdatePrivateDocDto = {
        ...pick(payload, `id`),
        ...pick(field, `visibility`, `mdate`, `cdate`, `code`, `name`),
      };

      await docsRepository.updateEntity(uid, entity);

      return dto;
    }

    if (payload.visibility === `public`) {
      const field: IPublicDocEntityField = {
        mdate: now,
        ...pick(doc, `cdate`),
        ...pick(payload, `visibility`, `name`, `code`),
      };
      const entity: IDocEntity = {
        [payload.id]: field,
      };
      const dto: IUpdatePublicDocDto = {
        ...pick(payload, `id`),
        ...pick(field, `visibility`, `mdate`, `cdate`, `code`, `name`),
      };

      await docsRepository.updateEntity(uid, entity);

      return dto;
    }

    if (payload.visibility === `permanent`) {
      const field: IPermanentDocEntityField = {
        mdate: now,
        ...pick(doc, `cdate`),
        ...pick(payload, `visibility`, `name`, `code`, `description`, `tags`),
        path: `/`,
        // TODO_ADD_PATH
      };
      const entity: IDocEntity = {
        [payload.id]: field,
      };
      const dto: IUpdatePermamentDocDto = {
        ...pick(payload, `id`),
        ...pick(
          field,
          `visibility`,
          `mdate`,
          `cdate`,
          `code`,
          `name`,
          `tags`,
          `description`,
          `path`,
        ),
      };

      if (await isDuplicated(docsRepository, payload)) {
        throw errors.alreadyExists(
          `ALREADY_EXISTS`,
          `Document with provided name already exists, please change name`,
        );
      }

      await docsRepository.updateEntity(uid, entity);

      return dto;
    }

    throw errors.invalidArgument(`INVALID_PAYLOAD`, `Wrong visibility`);
  },
};

export { UpdateDocService };
