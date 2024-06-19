import { z } from 'zod';

const documentSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(100)
    .refine((name) => /^[a-zA-Z0-9]+(?:\s[a-zA-Z0-9]+)*$/.test(name.trim())),
});

type DocumentModel = z.infer<typeof documentSchema>;

export type { DocumentModel };
export { documentSchema };
