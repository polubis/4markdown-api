import * as sharp from 'sharp';

const webp = ({ buffer, quality }: { buffer: Buffer; quality: number }) => {
  return sharp(buffer).webp({ quality }).toBuffer();
};

export { webp };
