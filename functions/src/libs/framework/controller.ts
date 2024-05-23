import { https } from 'firebase-functions';
import { IController } from './defs';

const Controller: IController =
  (...middleware) =>
  (handler) =>
    https.onCall((payload, context) => {
      middleware.forEach((fn) => {
        fn(context, payload);
      });

      return handler(context, payload);
    });

export { Controller };
