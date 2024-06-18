import { errors } from '../../libs/framework/errors';
import { mediator } from '../../libs/framework/mediator';

// DEFS //

// type Response = {
//   id: string;
//   name: string;
// };

// const command = {
//   check_auth: () => {
//     throw Error();
//   },
// };

// const query = {};

// const dispatch = dispatcher(query)(command);
// payload, context
const saveDocumentCodeMediator = mediator<Response>(
  { authentication: true },
  async () => {
    throw errors.exists();
  },
);

export { saveDocumentCodeMediator };
