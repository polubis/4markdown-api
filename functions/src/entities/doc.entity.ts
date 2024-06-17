import type {
  Code,
  DateStamp,
  Id,
  Name,
  Path,
  Description,
  Tags,
  Blob,
} from './general';

interface DocEntityFieldBase {
  name: Name;
  code: Code;
  cdate: DateStamp;
  mdate: DateStamp;
}

type DocThumbnail =
  | (Record<
      'xl' | 'lg' | 'md' | 'sm' | 'tn',
      {
        h: number;
        w: number;
        src: Path;
        ext: 'jpg' | 'jpeg' | 'webp' | 'png';
      }
    > & { placeholder: Blob })
  | null;

interface PermanentDocEntityField extends DocEntityFieldBase {
  visibility: 'permanent';
  description: Description;
  path: Path;
  tags?: Tags;
  thumbnail?: DocThumbnail;
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
  DocThumbnail,
};
