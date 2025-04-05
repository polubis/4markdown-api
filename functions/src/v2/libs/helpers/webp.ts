import sharp from 'sharp';

const webp = ({
  buffer,
  quality,
}: {
  buffer: Buffer;
  quality: number;
}): Promise<Buffer> => {
  return sharp(buffer).webp({ quality }).toBuffer();
};

export { webp };
