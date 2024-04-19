import { Blob } from '../entities/general';

// Example: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQE..
export const parseImage = (
  image: string,
): { blob: Blob; contentType: string; extension: string; buffer: Buffer } => {
  const [meta] = image.split(`,`);
  const contentType = meta.split(`:`)[1].split(`;`)[0];
  const extension = contentType.replace(`image/`, ``);
  const blob = image.replace(/^data:image\/\w+;base64,/, ``);
  const buffer = Buffer.from(blob, `base64`);

  return {
    blob,
    contentType,
    extension,
    buffer,
  };
};
