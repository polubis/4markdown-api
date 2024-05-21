import { https } from 'firebase-functions';

type EndpointHandler<TResponse = unknown> = (
  payload: unknown,
  context: https.CallableContext,
) => Promise<TResponse>;

const Endpoint = <TResponse = unknown>(handler: EndpointHandler<TResponse>) =>
  https.onCall(handler);

export { Endpoint };
