import { z } from 'zod';
import { createSlug } from './create-slug';

const documentNameSchema = z
  .string()
  .transform((name) => name.trim())
  .transform((raw) => {
    const path = createSlug(raw);

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

const documentTagsSchema = z
  .array(z.string().min(1).max(50))
  .min(1)
  .max(10)
  .refine(
    (tags) => tags.length === new Set([...tags]).size,
    `Tags must be unique`,
  )
  .refine(
    (tags) => tags.every((tag) => /^[a-zA-Z0-9,-]+$/.test(tag)),
    `Incorrect tag format. Each tag must contain 2-50 characters, using only letters or numbers`,
  );

export { documentNameSchema, documentCodeSchema, documentTagsSchema };
