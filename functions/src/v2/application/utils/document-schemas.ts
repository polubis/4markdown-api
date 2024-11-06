import { z } from 'zod';
import { createSlug } from './create-slug';

const documentNameSchema = z
  .string()
  .transform((name) => name.trim())
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
    if (!(raw.length >= 1 && raw.length <= 160)) {
      addIssue({
        code: `custom`,
        message: `Name must be between 1-160 characters`,
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
  .min(50)
  .max(250)
  .transform((description) => description.trim());

const documentCodeSchema = z.string();

const documentTagsWhiteList: Record<string, boolean> = {
  'c++': true,
  'c#': true,
  'f#': true,
};

const documentTagsSchema = z
  .array(
    z
      .string()
      .min(1)
      .max(40)
      .transform((tag) => tag.trim().toLowerCase())
      .transform((tag) => (documentTagsWhiteList[tag] ? tag : createSlug(tag)))
      .refine(
        (tag) => tag.length >= 1 && tag.length <= 40,
        `Invalid tag format`,
      ),
  )
  .min(1)
  .max(10)
  .refine(
    (tags) => tags.length === new Set([...tags]).size,
    `Tags must be unique`,
  );

export {
  documentNameSchema,
  documentCodeSchema,
  documentTagsSchema,
  documentDescriptionSchema,
  permanentDocumentNameSegmentsSchema,
};
