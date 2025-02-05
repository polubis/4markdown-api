import { z } from 'zod';
import { createSlug } from './create-slug';
import { tags } from './validators';

const documentNameSchema = z
  .string()
  .trim()
  .transform((name) => {
    const slug = createSlug(name);

    return {
      raw: name,
      path: `/${slug}/`,
      slug,
      segments: slug === `` ? [] : slug.split(`-`),
    };
  })
  .superRefine(({ segments, raw }, { addIssue }) => {
    if (!(raw.length >= 1 && raw.length <= 70)) {
      addIssue({
        code: `custom`,
        message: `Name must be between 1-70 characters`,
      });
    }

    if (!(segments.length >= 1 && segments.length <= 15)) {
      addIssue({
        code: `custom`,
        message: `Generated path from document name must be between 1-15`,
      });
    }
  });

const permanentDocumentNameSegmentsSchema = z.array(z.string()).min(3).max(15);

const documentDescriptionSchema = z
  .string()
  .trim()
  .min(110, `Description must be at least 110 characters`)
  .max(160, `Description must be fewer than 160 characters`);

const documentCodeSchema = z.string();

const documentTagsSchema = tags();

export {
  documentNameSchema,
  documentCodeSchema,
  documentTagsSchema,
  documentDescriptionSchema,
  permanentDocumentNameSegmentsSchema,
};
