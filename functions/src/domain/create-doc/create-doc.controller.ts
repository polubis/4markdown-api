import { Controller } from '../../libs/framework/controller';
import { nowISO } from '../../libs/utils/date';
import { uuid } from '../../libs/utils/uuid';
import { IDocEntity } from '../shared/entities/defs';
import { isAuthenticated } from '../shared/middleware/is-authenticated';
import { CreateDocPayload } from './create-doc.payload';
import * as admin from 'firebase-admin';

const createDocController = Controller<void>(isAuthenticated)(async (
  context,
  payload,
) => {
  const { uid } = isAuthenticated(context);
  const { name, code } = CreateDocPayload.parse(payload);
  const id = uuid();
  const cdate = nowISO();
  const visibility = `private`;
  const mdate = cdate;

  const entity: IDocEntity = {
    [id]: {
      cdate,
      mdate,
      visibility,
      code,
      name,
    },
  };

  const collection = admin.firestore().collection(`docs`).doc(uid);
  const docs = await collection.get();
});

export { createDocController };
