import { z } from 'zod';

type Vars = Partial<{ IMAGES_BUCKET: string }>;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Vars {}
  }
}

const msg = (name: keyof Vars): string =>
  `Wrong ${name} property config for environment`;

const schema = z.object({
  IMAGES_BUCKET: z
    .string()
    .regex(/^gs:\/\/[a-zA-Z0-9.-]+\.appspot\.com$/, msg(`IMAGES_BUCKET`)),
});

const { IMAGES_BUCKET } = schema.parse({
  IMAGES_BUCKET: process.env.IMAGES_BUCKET,
});

export { IMAGES_BUCKET };
