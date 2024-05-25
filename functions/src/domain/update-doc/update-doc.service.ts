import { errors } from '../../libs/framework/errors';
import { nowISO } from '../../libs/utils/date';
import { pick } from '../../libs/utils/pick';
import {
  DocEntity,
  PermamentDocEntityField,
  PrivateDocEntityField,
  PublicDocEntityField,
} from '../shared/entities/doc.entity';
import { IDocsRepository } from '../shared/repositories/defs';
import { DocsRepository } from '../shared/repositories/docs.repository';
import { IUpdateDocService, IUpdatePermamentDocPayload } from './defs';
import {
  UpdatePermamentDocDto,
  UpdatePrivateDocDto,
  UpdatePublicDocDto,
} from './update-doc.dto';

const isDuplicated = async (
  docsRepository: IDocsRepository,
  payload: IUpdatePermamentDocPayload,
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
      const field = await PrivateDocEntityField.parseAsync({
        mdate: now,
        ...pick(doc, `cdate`),
        ...pick(payload, `visibility`, `name`, `code`),
      });
      const [entity, dto] = await Promise.all([
        DocEntity.parseAsync({
          [payload.id]: field,
        }),
        UpdatePrivateDocDto.parseAsync({
          ...pick(payload, `id`),
          ...pick(field, `visibility`, `mdate`, `cdate`, `code`, `name`),
        }),
      ]);

      await docsRepository.updateEntity(uid, entity);

      return dto;
    }

    if (payload.visibility === `public`) {
      const field = await PublicDocEntityField.parseAsync({
        mdate: now,
        ...pick(doc, `cdate`),
        ...pick(payload, `visibility`, `name`, `code`),
      });
      const [entity, dto] = await Promise.all([
        DocEntity.parseAsync({
          [payload.id]: field,
        }),
        UpdatePublicDocDto.parseAsync({
          ...pick(payload, `id`),
          ...pick(field, `visibility`, `mdate`, `cdate`, `code`, `name`),
        }),
      ]);

      await docsRepository.updateEntity(uid, entity);

      return dto;
    }

    if (payload.visibility === `permament`) {
      const field = await PermamentDocEntityField.parseAsync({
        mdate: now,
        ...pick(doc, `cdate`),
        ...pick(payload, `visibility`, `name`, `code`, `description`, `tags`),
      });
      const [entity, dto] = await Promise.all([
        DocEntity.parseAsync({
          [payload.id]: field,
        }),
        UpdatePermamentDocDto.parseAsync({
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
          ),
        }),
      ]);

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
