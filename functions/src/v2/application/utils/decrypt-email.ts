import { createDecipheriv } from 'crypto';
import type { Email } from './validators';

const decryptEmail = ({
  key,
  iv,
  email,
}: {
  key: string;
  iv: string;
  email: Email;
}): Promise<Email> => {
  return new Promise((resolve, reject) => {
    try {
      const decipher = createDecipheriv(
        `aes-256-cbc`,
        Buffer.from(key, `hex`),
        Buffer.from(iv, `hex`),
      );
      let decrypted = decipher.update(email, `hex`, `utf8`);
      decrypted += decipher.final(`utf8`);
      return resolve(decrypted);
    } catch (error) {
      return reject(error);
    }
  });
};

export { decryptEmail };
