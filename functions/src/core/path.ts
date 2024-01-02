import type { Name, Path } from '../entities/general';
import { invalidArg } from './errors';

const createPath = (name: Name): Path | never => {
  const path = name.trim().replace(/ /g, `-`).toLowerCase();

  const invalid = !/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+){0,9}-[a-zA-Z0-9]+$/.test(
    path,
  );

  if (invalid) {
    throw invalidArg(`Path is invalid`);
  }

  return path;
};

export { createPath };
