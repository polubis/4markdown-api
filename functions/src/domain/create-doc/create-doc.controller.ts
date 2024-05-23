import { Controller } from '../../libs/framework/controller';
import { uuid } from '../../libs/utils/uuid';
import { isAuthenticated } from '../shared/is-authenticated';
import { createDocPayloadSchema } from './create-doc-payload.schema';

const createDocController = Controller<void>(isAuthenticated)(async (
  context,
  payload,
) => {
  const { name, code } = createDocPayloadSchema.parse(payload);
  const id = uuid();
});

export { createDocController };
