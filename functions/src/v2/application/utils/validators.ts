import { z } from 'zod';
import { regexes } from './regexes';
import { parse } from '../../libs/framework/parse';
import {
  imageModelContentTypes,
  imageModelExtensions,
} from '../../domain/models/image';

const imageSchema = z.object({
  blob: z.string().min(1),
  contentType: z.enum(imageModelContentTypes),
  extension: z.enum(imageModelExtensions),
  buffer: z.instanceof(Buffer),
  size: z.number().min(0).max(4),
});

const validators = {
  id: z.string().min(1),
  date: z.string().regex(regexes.date),
  document: {
    name: z
      .string()
      .min(2)
      .max(100)
      .regex(regexes.noEdgeSpaces)
      .refine((value) => regexes.document.name.test(value.trim())),
  },
  image: z
    .string()
    .regex(regexes.base64)
    .transform(async (value) => {
      const [meta] = value.split(`,`);
      const contentType = meta.split(`:`)[1].split(`;`)[0];
      const extension = contentType.replace(`image/`, ``);
      const blob = value.replace(/^data:image\/\w+;base64,/, ``);
      const buffer = Buffer.from(blob, `base64`);
      // Size in Megabytes.
      const size = Number.parseFloat(
        (Buffer.byteLength(buffer) / 1024 / 1024).toFixed(2),
      );

      const image = {
        blob,
        contentType,
        extension,
        buffer,
        size,
      };

      return await parse(imageSchema, image);
    }),
};

export { validators };
