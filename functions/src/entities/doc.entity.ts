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

type DocThumbnailVariant<TKey extends string> = {
  [key in TKey]: {
    h: number;
    w: number;
    src: Path;
    ext: 'jpg' | 'jpeg' | 'webp' | 'png';
    id: Id;
  };
};

type DocThumbnail =
  | (DocThumbnailVariant<`xl`> &
      DocThumbnailVariant<'lg'> &
      DocThumbnailVariant<'md'> &
      DocThumbnailVariant<'sm'> &
      DocThumbnailVariant<'tn'> & { placeholder: Blob })
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
