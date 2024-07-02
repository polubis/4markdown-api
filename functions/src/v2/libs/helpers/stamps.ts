import { v4 } from 'uuid';

const nowISO = () => new Date().toISOString();

const uuid = v4;

export { nowISO, uuid };
