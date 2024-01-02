import { DocVisibility } from '../entities/doc.entity';
import { invalidArg } from './errors';

const isValidVisibility = (visibility: string): visibility is DocVisibility => {
  const options: DocVisibility[] = [`public`, `private`, `permanent`];

  return options.includes(visibility as DocVisibility);
};

export const getVisibility = (visibility: unknown): DocVisibility | never => {
  if (typeof visibility !== `string` || !isValidVisibility(visibility))
    throw invalidArg(`Unsupported visibility value`);

  return visibility;
};
