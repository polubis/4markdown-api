import { errors } from '../../libs/framework/errors';
import { nowISO } from '../../libs/utils/date';
import { uuid } from '../../libs/utils/uuid';
import {
  DocEntity,
  PrivateDocEntityField,
} from '../shared/entities/doc.entity';
import { DocsRepository } from '../shared/repositories/docs.repository';
import { CreateDocDto } from './create-doc.dto';
import { ICreateDocService } from './defs';

const CreateDocService: ICreateDocService = {
  create: async (uid, { name, code }) => {
    const id = uuid();
    const cdate = nowISO();
    const visibility = `private`;
    const mdate = cdate;

    const entityField = await PrivateDocEntityField.parseAsync({
      cdate,
      mdate,
      visibility,
      code,
      name,
    });

    const [entity, dto] = await Promise.all([
      DocEntity.parseAsync({
        [id]: entityField,
      }),
      CreateDocDto.parseAsync({ ...entityField, id }),
    ]);

    const docsRepository = DocsRepository();
    const doc = await docsRepository.getEntity(uid);

    if (!doc) {
      await docsRepository.setEntity(uid, entity);
      return dto;
    }

    const hasDuplicate = Object.values(doc).some((f) => f.name === dto.name);

    if (hasDuplicate) {
      throw errors.alreadyExists(
        `ALREADY_EXISTS`,
        `Document with provided name already exists`,
      );
    }

    await docsRepository.setEntity(uid, {
      ...doc,
      ...entity,
    });

    return dto;
  },
};

export { CreateDocService };
