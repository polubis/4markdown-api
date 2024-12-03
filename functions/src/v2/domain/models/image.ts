import type { Url } from '@utils/validators';

const IMAGE_EXTENSIONS = [`jpg`, `jpeg`, `png`, `webp`, `gif`] as const;

type ImageExtension = (typeof IMAGE_EXTENSIONS)[number];

type ImageContentType = `image/${ImageExtension}`;

const IMAGE_CONTENT_TYPES = IMAGE_EXTENSIONS.map<ImageContentType>(
  (extension) => `image/${extension}`,
);

type ImageModel = {
  extension: ImageExtension;
  url: Url;
  contentType: ImageContentType;
};

export { IMAGE_EXTENSIONS, IMAGE_CONTENT_TYPES };
export type { ImageModel };
