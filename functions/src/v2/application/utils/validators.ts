import { z } from 'zod';
import { regexes } from './regexes';

const validators = {
  id: z.string().min(1),
  date: z.string().regex(regexes.date),
};

const email = z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
const base64 = z.string().min(1).regex(regexes.base64);

type Id = z.infer<typeof validators.id>;
type Date = z.infer<typeof validators.date>;
type Email = z.infer<typeof email>;
type Url = string;
type Base64 = z.infer<typeof base64>;

export type { Id, Date, Email, Url, Base64 };
export { validators, email, base64 };
