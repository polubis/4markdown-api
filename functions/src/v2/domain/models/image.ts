const imageModelContentTypes = [
  `image/png`,
  `image/jpg`,
  `image/jpeg`,
  `image/gif`,
] as const;
const imageModelExtensions = [`png`, `jpg`, `jpeg`, `gif`] as const;

type ImageModelContentType = (typeof imageModelContentTypes)[number];
type ImageModelExtension = (typeof imageModelExtensions)[number];

type ImageModel = {
  contentType: ImageModelContentType;
  extension: ImageModelExtension;
  url: string;
};

type ImagesModel = Record<string, ImageModel>;

export { imageModelContentTypes, imageModelExtensions };
export type {
  ImageModelContentType,
  ImageModelExtension,
  ImageModel,
  ImagesModel,
};
