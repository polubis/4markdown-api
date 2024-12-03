import type { Url } from '@utils/validators';

const IMAGE_EXTENSIONS = [`jpg`, `jpeg`, `png`, `webp`, `gif`] as const;

type ImageExtension = (typeof IMAGE_EXTENSIONS)[number];

type ImageModel = {
  extension: ImageExtension;
  url: Url;
};

export type { ImageModel };
