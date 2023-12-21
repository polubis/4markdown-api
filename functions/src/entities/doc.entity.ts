import type { Id } from './general';

type DocVisibility = 'public' | 'private';

interface DocEntityField {
  name: string;
  code: string;
  cdate: string;
  mdate: string;
  visibility: DocVisibility;
}

type DocEntity = Record<Id, DocEntityField>;

export type { DocEntity, DocEntityField, DocVisibility };
