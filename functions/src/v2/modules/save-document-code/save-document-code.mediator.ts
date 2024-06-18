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
    // payload
    // const id = payload.id;
    // const code = payload.code;
    // const mdate = payload.mdate;

    throw errors.exists();
  },
);

export { saveDocumentCodeMediator };
