import { z } from 'zod';
import { regexes } from './regexes';
import { createDocumentPath } from './create-document-path';

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

const documentName = z
  .string()
  .transform((name) => name.trim())
  .transform((name) => ({
    path: createDocumentPath(name),
    name,
  }))
  .refine(
    ({ path }) => path.length >= 3 && path.length <= 15,
    `Generated path from document name must be between 3-15`,
  );

const email = z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

type Id = z.infer<typeof validators.id>;
type Date = z.infer<typeof validators.date>;
type Email = z.infer<typeof email>;
type Url = string;
type DocumentName = z.infer<typeof documentName>;

export type { Id, Date, Email, Url, DocumentName };
export { validators, email };
