import { errors } from '../../libs/framework/errors';
import { nowISO } from '../../libs/utils/date';
import { uuid } from '../../libs/utils/uuid';
import { IDocEntity, IPrivateDocEntityField } from '../shared/entities/defs';
import { DocsRepository } from '../shared/repositories/docs.repository';
import { ICreateDocDto, ICreateDocService } from './defs';

const CreateDocService: ICreateDocService = {
  create: async (uid, { name, code }) => {
    const id = uuid();
    const now = nowISO();

    const field: IPrivateDocEntityField = {
      cdate: now,
      mdate: now,
      visibility: `private`,
      code,
      name,
    };
    const entity: IDocEntity = {
      [id]: field,
    };
    const dto: ICreateDocDto = {
      ...field,
      id,
    };

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
