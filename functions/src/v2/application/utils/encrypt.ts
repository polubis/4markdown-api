import { randomBytes, createCipheriv } from 'crypto';

const encrypt = ({
  key,
  data,
}: {
  key: string;
  data: string;
}): { iv: string; value: string } => {
  const iv = randomBytes(16);
  const cipher = createCipheriv(`aes-256-cbc`, key, iv);

  let value = cipher.update(data, `utf8`, `hex`);
  value += cipher.final(`hex`);

  return { iv: iv.toString(`hex`), value };
};

export { encrypt };
