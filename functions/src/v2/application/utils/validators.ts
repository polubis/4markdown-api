import { z } from 'zod';
import { regexes } from './regexes';

const validators = {
  id: z.string().min(1),
  date: z.string().regex(regexes.date),
  document: {
    name: z
      .string()
      .min(2)
      .max(100)
      .regex(regexes.noEdgeSpaces)
      .refine((value) => regexes.document.name.test(value.trim())),
    code: z.string(),
  },
};

const email = z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

type Id = z.infer<typeof validators.id>;
type Date = z.infer<typeof validators.date>;
type Email = z.infer<typeof email>;
type Url = string;

export type { Id, Date, Email, Url };
export { validators, email };
