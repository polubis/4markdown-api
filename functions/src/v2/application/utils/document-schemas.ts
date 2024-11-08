import { z } from 'zod';
import { createSlug } from './create-slug';

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

const documentTagsWhiteList: Record<string, boolean> = {
  'c++': true,
  'c#': true,
  'f#': true,
};

const documentTagsSchema = z
  .array(
    z
      .string()
      .trim()
      .toLowerCase()
      .min(1, `Tag must be at least 1 character`)
      .max(40, `Tag must be fewer than 40 characters`)
      .transform((tag) => (documentTagsWhiteList[tag] ? tag : createSlug(tag)))
      .refine(
        (tag) => tag.length >= 1 && tag.length <= 40,
        `One of the tags has an invalid format`,
      ),
  )
  .min(1, `At least 1 tag is required`)
  .max(10, `No more than 10 tags are allowed`)
  .refine(
    (tags) => tags.length === new Set([...tags]).size,
    `Tags contain duplicates`,
  );

export {
  documentNameSchema,
  documentCodeSchema,
  documentTagsSchema,
  documentDescriptionSchema,
  permanentDocumentNameSegmentsSchema,
};
