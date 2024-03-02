import { z } from 'zod';
import { errors } from './errors';

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

const env = (key: keyof Vars) => {
  try {
    return schema.parse(process.env)[key];
  } catch {
    throw errors.internal(`Wrong with environment configuration`);
  }
};

export { env };
