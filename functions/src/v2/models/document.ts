import { z } from 'zod';

const documentModel = {
  name: z
    .string()
    .min(2)
    .max(100)
    .refine((name) => /^[a-zA-Z0-9]+(?:\s[a-zA-Z0-9]+)*$/.test(name.trim())),
};

export { documentModel };
