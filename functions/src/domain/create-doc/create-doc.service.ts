import { errors } from '../../libs/framework/errors';
import { nowISO } from '../../libs/utils/date';
import { pick } from '../../libs/utils/pick';
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
    const now = nowISO();

    const field = await PrivateDocEntityField.parse({
      cdate: now,
      mdate: now,
      visibility: `private`,
      code,
      name,
    });
    const entity = await DocEntity.parseAsync({
      [id]: field,
    });
    const dto = await CreateDocDto.parseAsync({
      ...pick(field, `cdate`, `mdate`, `visibility`, `code`, `name`),
      id,
    });

    const docsRepository = DocsRepository();
    const docEntity = await docsRepository.getEntity(uid);

    if (!docEntity) {
      await docsRepository.setEntity(uid, entity);
      return dto;
    }

    const hasDuplicate = Object.values(docEntity).some(
      (field) => field.name === dto.name,
    );

    if (hasDuplicate) {
      throw errors.alreadyExists(
        `ALREADY_EXISTS`,
        `Document with provided name already exists`,
      );
    }

    docEntity[id] = entity[id];

    await docsRepository.setEntity(uid, docEntity);

    return dto;
  },
};

export { CreateDocService };
