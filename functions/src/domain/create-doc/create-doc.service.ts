import { errors } from '../../libs/framework/errors';
import { nowISO } from '../../libs/utils/date';
import { uuid } from '../../libs/utils/uuid';
import { DocEntity } from '../shared/entities/doc.entity';
import { DocsRepository } from '../shared/repositories/docs.repository';
import { CreateDocDto } from './create-doc.dto';
import { ICreateDocService } from './defs';

const CreateDocService: ICreateDocService = {
  create: async (uid, { name, code }) => {
    const id = uuid();
    const cdate = nowISO();
    const visibility = `private`;
    const mdate = cdate;

    const [entity, dto] = await Promise.all([
      DocEntity.parseAsync({
        [id]: {
          cdate,
          mdate,
          visibility,
          code,
          name,
        },
      }),
      CreateDocDto.parseAsync({ cdate, mdate, visibility, code, name, id }),
    ]);

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
