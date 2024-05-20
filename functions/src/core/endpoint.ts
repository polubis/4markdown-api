import { https } from 'firebase-functions';

type EndpointHandler = (
  payload: unknown,
  context: https.CallableContext,
) => Promise<void>;

const Endpoint = (handler: EndpointHandler) => https.onCall(handler);

export { Endpoint };
