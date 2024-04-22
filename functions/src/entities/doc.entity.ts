import type {
  Code,
  DateStamp,
  Id,
  Name,
  Path,
  Description,
  Tags,
  Url,
} from './general';

interface DocEntityFieldBase {
  name: Name;
  code: Code;
  cdate: DateStamp;
  mdate: DateStamp;
}

const THUMBNAIL_EXTENSIONS = [`png`, `jpeg`, `jpg`, `webp`] as const;
const thumbnailSizes = [`xl`, `lg`, `md`, `sm`, `xs`] as const;

type ThumbnailExtension = (typeof THUMBNAIL_EXTENSIONS)[number];
type ThumbnailContentType = `image/${ThumbnailExtension}`;
type ThumbnailSize = (typeof thumbnailSizes)[number];
type DocThumbnailUrls = Record<ThumbnailSize, Url>;

type DocThumbnail = {
  id: Id;
  extension: ThumbnailExtension;
  contentType: ThumbnailContentType;
  urls: DocThumbnailUrls;
};

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
  ThumbnailExtension,
  ThumbnailSize,
  DocThumbnailUrls,
  ThumbnailContentType,
};
export { THUMBNAIL_EXTENSIONS, thumbnailSizes };
