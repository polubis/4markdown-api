import { https } from 'firebase-functions';
import { IController } from './defs';

const Controller: IController =
  (...middleware) =>
  (handler) =>
    https.onCall((payload, context) => {
      middleware.forEach((fn) => {
        fn(payload, context);
      });

      return handler(payload, context);
    });

export { Controller };
