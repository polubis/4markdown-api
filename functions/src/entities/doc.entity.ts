import type { Id } from './general';

interface DocEntityField {
  name: string;
  code: string;
}

type DocEntity = Record<Id, DocEntityField>;

export type { DocEntity, DocEntityField };
