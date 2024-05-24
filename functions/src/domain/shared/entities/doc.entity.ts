import { z } from 'zod';
import {
  dateRgx,
  docNameRgx,
  noEdgeSpacesRgx,
  singleSegmentPathRgx,
  docTagRgx,
} from '../consts/regexes';
import { Uid } from './atoms';

const DocEntityFieldBase = z
  .object({
    name: z.string().regex(noEdgeSpacesRgx).regex(docNameRgx).min(2).max(100),
    code: z.string(),
    cdate: z.string().regex(dateRgx),
    mdate: z.string().regex(dateRgx),
  })
  .strict();

const PrivateDocEntityField = DocEntityFieldBase.extend({
  visibility: z.literal(`private`),
}).strict();

const PublicDocEntityField = DocEntityFieldBase.extend({
  visibility: z.literal(`public`),
}).strict();

const PermamentDocEntityField = DocEntityFieldBase.extend({
  name: DocEntityFieldBase.shape.name.refine(
    (name) => name.trim().split(` `).length >= 3,
    {
      message: `Name must consist of at least three words`,
    },
  ),
  visibility: z.literal(`permament`),
  description: z.string().regex(noEdgeSpacesRgx).min(50).max(250),
  tags: z
    .array(z.string().regex(docTagRgx).min(2).max(50).regex(noEdgeSpacesRgx))
    .min(1)
    .max(10),
  path: z
    .string()
    .regex(singleSegmentPathRgx)
    .regex(noEdgeSpacesRgx)
    .refine(
      (path) => {
        const innerPath = path.slice(1, path.length - 1);
        return innerPath.split(`-`).length >= 3;
      },
      {
        message: `The path must contain at least three hyphen-separated segments`,
      },
    ),
}).strict();

const DocEntityField = z.union([
  PrivateDocEntityField,
  PublicDocEntityField,
  PermamentDocEntityField,
]);

const DocEntity = z.record(Uid, DocEntityField);

export {
  DocEntity,
  DocEntityField,
  PrivateDocEntityField,
  PublicDocEntityField,
  PermamentDocEntityField,
};
