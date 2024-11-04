import { z } from 'zod';
import { createDocumentPath } from './create-document-path';

const documentNameSchema = z
  .string()
  .transform((name) => name.trim())
  .transform((raw) => {
    const path = createDocumentPath(raw);

    return {
      raw,
      path,
      segments: path.split(`-`),
    };
  })
  .refine(
    ({ segments }) => segments.length >= 3 && segments.length <= 15,
    `Generated path from document name must be between 3-15`,
  );

const documentCodeSchema = z.string();

export { documentNameSchema, documentCodeSchema };
