import { z } from 'zod';

const commentContentSchema = z
  .string()
  .trim()
  .min(1, `Content of comment cannot be empty`)
  .max(250, `Content of comment must be fewer than 250 characters`);

export { commentContentSchema };
