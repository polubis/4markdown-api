const IMAGE_EXTENSIONS = [`png`, `jpeg`, `jpg`, `gif`] as const;

type ImageExtension = (typeof IMAGE_EXTENSIONS)[number];
type ImageContentType = `image/${ImageExtension}`;

export type { ImageExtension, ImageContentType };
export { IMAGE_EXTENSIONS };
