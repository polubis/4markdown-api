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
  },
};

export { validators };
