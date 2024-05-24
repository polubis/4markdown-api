import { Controller } from '../../libs/framework/controller';
import { errors } from '../../libs/framework/errors';
import { nowISO } from '../../libs/utils/date';
import { uuid } from '../../libs/utils/uuid';
import {
  DocEntity,
  PrivateDocEntityField,
} from '../shared/entities/doc.entity';
import { isAuthenticated } from '../shared/middleware/is-authenticated';
import { DocsRepository } from '../shared/repositories/docs.repository';
import { CreateDocDto } from './create-doc.dto';
import { CreateDocPayload } from './create-doc.payload';
import { ICreateDocDto } from './defs';

const createDocController = Controller<ICreateDocDto>(
  async (context, payload) => {
    const auth = isAuthenticated(context);
    const { name, code } = await CreateDocPayload.parseAsync(payload);
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
    const doc = await docsRepository.getEntity(auth.uid);

    if (!doc) {
      await docsRepository.setEntity(auth.uid, entity);
      return dto;
    }

    const hasDuplicate = Object.values(doc).some((f) => f.name === name);

    if (hasDuplicate) {
      throw errors.alreadyExists(
        `ALREADY_EXISTS`,
        `Document with provided name already exists`,
      );
    }

    await docsRepository.setEntity(auth.uid, {
      ...doc,
      ...entity,
    });

    return dto;
  },
);

export { createDocController };
