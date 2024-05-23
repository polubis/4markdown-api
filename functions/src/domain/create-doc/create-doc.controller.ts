import { Controller } from '../../libs/framework/controller';
import { nowISO } from '../../libs/utils/date';
import { uuid } from '../../libs/utils/uuid';
import {
  DocEntity,
  PrivateDocEntityField,
} from '../shared/entities/doc.entity';
import { isAuthenticated } from '../shared/middleware/is-authenticated';
import { CreateDocPayload } from './create-doc.payload';
import { firestore } from 'firebase-admin';

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

  const collection = firestore().collection(`docs`).doc(uid);
  const docs = await collection.get();
});

export { createDocController };
