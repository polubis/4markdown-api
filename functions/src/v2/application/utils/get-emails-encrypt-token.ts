import { errors } from './errors';
// @TODO[PRIO=2]: [Move all related encryption codebase to separate library].
const getEmailsEncryptToken = (): { key: string; iv: string } => {
  const rawKey = process.env.EMAILS_ENCRYPTION_TOKEN;

  if (!rawKey) throw errors.internal();

  const [key, iv] = rawKey.split(`|`);

  if (!key || !iv) throw errors.internal();

  return { key, iv };
};

export { getEmailsEncryptToken };
