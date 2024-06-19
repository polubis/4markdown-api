import { z } from 'zod';
import { validators } from '../../application/utils/validators';

const documentObjSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(100)
    .refine((name) => /^[a-zA-Z0-9]+(?:\s[a-zA-Z0-9]+)*$/.test(name.trim())),
  code: z.string(),
  mdate: validators.date,
  cdate: validators.date,
  id: validators.id,
});

const documentSchema = z.record(z.string(), documentObjSchema);

type DocumentModelObject = z.infer<typeof documentObjSchema>;
type DocumentModel = z.infer<typeof documentSchema>;

export type { DocumentModel, DocumentModelObject };
export { documentObjSchema, documentSchema };
