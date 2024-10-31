import { z } from 'zod';
import { regexes } from './regexes';

const validators = {
  id: z.string().min(1),
  date: z.string().regex(regexes.date),
};

const email = z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

type Id = z.infer<typeof validators.id>;
type Date = z.infer<typeof validators.date>;
type Email = z.infer<typeof email>;
type Url = string;

export type { Id, Date, Email, Url };
export { validators, email };
