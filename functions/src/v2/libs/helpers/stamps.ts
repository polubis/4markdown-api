import { v4 } from 'uuid';
import { createHash } from 'crypto';

const nowISO = () => new Date().toISOString();

const uuid = v4;

const shortUuid = (): string => {
  const uuid = v4();
  const hash = createHash(`sha256`).update(uuid).digest(`hex`);
  return hash.slice(0, 12);
};

export { nowISO, uuid, shortUuid };
