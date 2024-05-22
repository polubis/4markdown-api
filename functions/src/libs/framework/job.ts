import { pubsub } from 'firebase-functions';
import { IJob } from './defs';

const Job: IJob = (interval, handler) =>
  pubsub.schedule(interval).onRun(handler);

export { Job };
