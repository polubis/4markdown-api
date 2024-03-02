import { z } from 'zod';

const schema = z.object({
  IMAGES_BUCKET: z.string().transform((val) => {
    if (!val.startsWith(`gs://`)) {
      throw Error(`Invalid apiUrl format`);
    }

    return val;
  }),
});

const { IMAGES_BUCKET } = schema.parse(process.env);

export { IMAGES_BUCKET };
