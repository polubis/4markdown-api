import { https } from 'firebase-functions';
import { IController } from './defs';

const Controller: IController = (handler) => https.onCall(handler);

export { Controller };
