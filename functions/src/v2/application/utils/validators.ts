import { z } from 'zod';
import { regexes } from './regexes';

const id = z.string().trim().min(1);
const email = z
  .string()
  .trim()
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
const base64 = z.string().trim().min(1).regex(regexes.base64);
const date = z.string().regex(regexes.date);
const url = z.string().trim().url();
const text = z.string().trim();

type Id = z.infer<typeof id>;
type Date = z.infer<typeof date>;
type Email = z.infer<typeof email>;
type Url = z.infer<typeof url>;
type Base64 = z.infer<typeof base64>;
type Text = z.infer<typeof text>;

export type { Id, Date, Email, Url, Base64, Text };
export { id, date, email, base64, url, text };
