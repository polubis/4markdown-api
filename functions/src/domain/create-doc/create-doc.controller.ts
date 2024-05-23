import { Controller } from '../../libs/framework/controller';
import { nowISO } from '../../libs/utils/date';
import { uuid } from '../../libs/utils/uuid';
import {
  DocEntity,
  PrivateDocEntityField,
} from '../shared/entities/doc.entity';
import { isAuthenticated } from '../shared/middleware/is-authenticated';
import { DocsRepository } from '../shared/repositories/docs.repository';
import { CreateDocPayload } from './create-doc.payload';

const createDocController = Controller<void>(async (context, payload) => {
  const { uid } = isAuthenticated(context);
  const { name, code } = CreateDocPayload.parse(payload);
  const id = uuid();
  const cdate = nowISO();
  const visibility = `private`;
  const mdate = cdate;

  const entityField = PrivateDocEntityField.parse({
    cdate,
    mdate,
    visibility,
    code,
    name,
  });

  const entity = DocEntity.parse({
    [id]: entityField,
  });

  const docsRepository = DocsRepository();
  const docs = await docsRepository.getEntity(uid);
  console.log(entity, docs);

  // if (!docs.exists) {
  //   await docsCollection.set(<DocEntity>{
  //     [id]: field,
  //   });
  //   return dto;
  // }
});

export { createDocController };
