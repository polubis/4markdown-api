import { https } from 'firebase-functions';
import { IEndpoint } from './defs';

const Endpoint: IEndpoint = (handler) => https.onCall(handler);

export { Endpoint };
