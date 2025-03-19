import { controller } from '@utils/controller';
import { parse } from '@utils/parse';
import { url } from '@utils/validators';
import { z } from 'zod';

const payloadSchema = z.object({
  title: z
    .string()
    .trim()
    .min(10, `Title must be at least 10 characters`)
    .max(100, `Title must be less than 100 characters`),
  description: z
    .string()
    .trim()
    .min(30, `Description must be at least 30 characters`)
    .max(500, `Description must be less than 500 characters`),
  url: url(`Wrong URL format`),
});

type Dto = null;

const reportBugController = controller<Dto>(async (rawPayload, { db }) => {
  const payload = await parse(payloadSchema, rawPayload);

  await db.collection(`bug-reports`).add(payload);

  return null;
});

export { reportBugController };
