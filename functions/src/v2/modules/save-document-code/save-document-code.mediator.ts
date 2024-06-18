import { errors } from '../../../core/errors';
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
const saveDocumentCodeMediator = mediator<Response>(async () => {
  throw errors.exists(`Record already exists`);
});

export { saveDocumentCodeMediator };
