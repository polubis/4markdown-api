import { errors } from '../../libs/framework/errors';
import { nowISO } from '../../libs/utils/date';
import { pick } from '../../libs/utils/pick';
import { PrivateDocEntityField } from '../shared/entities/doc.entity';
import { DocsRepository } from '../shared/repositories/docs.repository';
import { IUpdateDocService } from './defs';
import { UpdatePrivateDocDto } from './update-doc.dto';

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
      const dto = await UpdatePrivateDocDto.parseAsync({
        ...pick(payload, `id`),
        ...pick(field, `visibility`, `mdate`, `cdate`, `code`, `name`),
      });

      docEntity[payload.id] = field;

      await docsRepository.setEntity(uid, docEntity);

      return dto;
    }

    throw errors.invalidArgument(`INVALID_PAYLOAD`, `Wrong visibility`);
  },
};

export { UpdateDocService };
