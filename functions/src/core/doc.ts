import { DocVisibility } from '../entities/doc.entity';
import { invalidArg } from './errors';

const isValidVisibility = (visibility: string): visibility is DocVisibility => {
  const options: DocVisibility[] = [`public`, `private`];

  return options.includes(visibility as DocVisibility);
};

export const getVisibility = (visibility: unknown): DocVisibility | never => {
  if (typeof visibility !== `string`)
    throw invalidArg(`Unsupported visibility value`);

  if (!isValidVisibility(visibility)) {
    throw invalidArg(`Unsupported visibility value`);
  }

  return visibility;
};
