import { decodeBase64Asset } from '@libs/decoding/decode-base-64-asset';
import { z } from 'zod';

const supportedFormats = [`gif`, `png`, `jpeg`, `jpg`, `webp`] as const;

const message = `Invalid file format. Supported formats are: ${supportedFormats.join(
  `, `,
)}.`;

const uploadImagePayloadSchema = z
  .string()
  .min(1, message)
  .trim()
  .base64(message)
  .transform(decodeBase64Asset)
  .refine(
    (image) =>
      z
        .object({
          blob: z.string(),
          contentType: z.string().regex(/^image\/(?:gif|png|jpe?g|webp)$/),
          extension: z.enum(supportedFormats),
        })
        .strict()
        .safeParse(image).success,
    message,
  );

export { uploadImagePayloadSchema };
