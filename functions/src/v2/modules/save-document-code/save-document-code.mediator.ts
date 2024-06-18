import { errors } from '../../libs/framework/exceptions';
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
  async (payload, context, authenticated) => {
    if (!authenticated) throw errors.unauthenticated();

    throw errors.exists();
  },
);

export { saveDocumentCodeMediator };
