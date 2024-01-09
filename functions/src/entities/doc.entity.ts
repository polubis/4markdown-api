import type { Code, DateStamp, Id, Name, Path, Thumbnail } from './general';

interface DocEntityFieldBase {
  name: Name;
  code: Code;
  cdate: DateStamp;
  mdate: DateStamp;
}

interface PermanentDocEntityField extends DocEntityFieldBase {
  visibility: 'permanent';
  path: Path;
  thumbnail: Thumbnail;
}

interface PublicDocEntityField extends DocEntityFieldBase {
  visibility: 'public';
}

interface PrivateDocEntityField extends DocEntityFieldBase {
  visibility: 'private';
}

type DocEntityField =
  | PermanentDocEntityField
  | PublicDocEntityField
  | PrivateDocEntityField;

type DocVisibility = DocEntityField['visibility'];

type DocEntity = Record<Id, DocEntityField>;

export type {
  DocEntity,
  DocEntityField,
  DocVisibility,
  PermanentDocEntityField,
  PublicDocEntityField,
  PrivateDocEntityField,
};
