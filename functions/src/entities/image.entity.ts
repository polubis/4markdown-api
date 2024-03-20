import { Id, Path } from './general';

const IMAGE_EXTENSIONS = [`png`, `jpeg`, `jpg`, `gif`] as const;

type ImageExtension = (typeof IMAGE_EXTENSIONS)[number];
type ImageContentType = `image/${ImageExtension}`;

interface ImageEntityContent {
  extension: ImageExtension;
  contentType: ImageContentType;
  url: Path;
}

type ImageEntity = Record<Id, ImageEntityContent>;

export type {
  ImageExtension,
  ImageContentType,
  ImageEntity,
  ImageEntityContent,
};
export { IMAGE_EXTENSIONS };
