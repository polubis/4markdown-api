import { error } from '../../libs/framework/exceptions';
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
  throw error(`exists`, `Something is really wrong`);
});

export { saveDocumentCodeMediator };
