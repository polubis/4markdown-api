import { z } from 'zod';
import { regexes } from './regexes';
import { createSlug } from './create-slug';

const id = z.string().trim().min(1);
const clientGeneratedId = () =>
  z
    .string()
    .regex(/^[0-9]+(\.[0-9]+)?:[0-9]+(\.[0-9]+)?$/, {
      message: `Invalid unique client ID format`,
    })
    .transform((value) => value as `${number}:${number}`);

const email = z
  .string()
  .trim()
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
const base64 = (message: string) =>
  z.string().trim().min(1, message).regex(regexes.base64, message);
const date = z.string().trim().regex(regexes.date);
const url = (message: string) => z.string().trim().url(message);
const text = z.string().trim();

const cords = () =>
  z.object({
    x: z.number(),
    y: z.number(),
  });

const tagsWhiteList: Record<string, boolean> = {
  'c++': true,
  'c#': true,
  'f#': true,
};

const tags = () =>
  z
    .array(
      z
        .string()
        .trim()
        .toLowerCase()
        .min(1, `Tag must be at least 1 character`)
        .max(40, `Tag must be fewer than 40 characters`)
        .transform((tag) => (tagsWhiteList[tag] ? tag : createSlug(tag)))
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

const description = () =>
  z
    .string()
    .trim()
    .min(110, `Description must be at least 110 characters`)
    .max(160, `Description must be fewer than 160 characters`);

const name = () =>
  z
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

type Id = z.infer<typeof id>;
type Date = z.infer<typeof date>;
type Email = z.infer<typeof email>;
type Url = z.infer<ReturnType<typeof url>>;
type Base64 = z.infer<ReturnType<typeof base64>>;
type Text = z.infer<typeof text>;
type Slug = string;
type Path = string;
type ClientGeneratedId = z.infer<ReturnType<typeof clientGeneratedId>>;

export type {
  Id,
  Date,
  Email,
  Url,
  Base64,
  Text,
  Slug,
  Path,
  ClientGeneratedId,
};
export {
  id,
  date,
  email,
  base64,
  url,
  text,
  tags,
  description,
  cords,
  name,
  clientGeneratedId,
};
