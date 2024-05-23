import { https } from 'firebase-functions';
import { IController } from './defs';

const Controller: IController = (handler) =>
  https.onCall((payload, context) => handler(context, payload));

export { Controller };
