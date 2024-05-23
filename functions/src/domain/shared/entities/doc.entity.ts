import { z } from 'zod';
import { dateRgx, docNameRgx, noEdgeSpacesRgx } from '../consts/regexes';
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
  visibility: z.literal(`permament`),
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
