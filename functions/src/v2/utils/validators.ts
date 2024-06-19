import { z } from 'zod';
import { regexes } from './regexes';

const validators = {
  id: z.string(),
  date: z.string().regex(regexes.date),
};

export { validators };
