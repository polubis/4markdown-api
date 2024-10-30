import { createCipheriv } from 'crypto';
import type { Email } from './validators';

const encryptEmail = ({
  key,
  iv,
  email,
}: {
  key: string;
  iv: string;
  email: Email;
}): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const cipher = createCipheriv(
        `aes-256-cbc`,
        Buffer.from(key, `hex`),
        Buffer.from(iv, `hex`),
      );
      let encrypted = cipher.update(email, `utf8`, `hex`);
      encrypted += cipher.final(`hex`);
      return resolve(encrypted);
    } catch (error) {
      return reject(error);
    }
  });
};

export { encryptEmail };
