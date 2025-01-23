import { z } from 'zod';
import { regexes } from './regexes';

const id = z.string().trim().min(1);
const email = z
  .string()
  .trim()
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
const base64 = (message: string) =>
  z.string().trim().min(1, message).regex(regexes.base64, message);
const date = z.string().trim().regex(regexes.date);
const url = (message: string) => z.string().trim().url(message);
const text = z.string().trim();

type Id = z.infer<typeof id>;
type Date = z.infer<typeof date>;
type Email = z.infer<typeof email>;
type Url = z.infer<ReturnType<typeof url>>;
type Base64 = z.infer<ReturnType<typeof base64>>;
type Text = z.infer<typeof text>;
type Slug = string;

export type { Id, Date, Email, Url, Base64, Text, Slug };
export { id, date, email, base64, url, text };
