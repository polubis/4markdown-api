import { z } from 'zod';
import { dateRgx, docNameRgx, noEdgeSpacesRgx } from '../consts/regexes';

const DocEntityFieldBase = z.object({
  name: z.string().regex(noEdgeSpacesRgx).regex(docNameRgx).min(2).max(100),
  code: z.string(),
  cdate: z.string().regex(dateRgx),
  mdate: z.string().regex(dateRgx),
});

const PrivateDocEntityField = DocEntityFieldBase.extend({
  visibility: z.literal(`private`),
});

const PublicDocEntityField = DocEntityFieldBase.extend({
  visibility: z.literal(`public`),
});

const PermamentDocEntityField = DocEntityFieldBase.extend({
  visibility: z.literal(`permament`),
});

const DocEntityField = z.union([
  PrivateDocEntityField,
  PublicDocEntityField,
  PermamentDocEntityField,
]);

const DocEntity = z.record(DocEntityField);

export { DocEntity, DocEntityField };
