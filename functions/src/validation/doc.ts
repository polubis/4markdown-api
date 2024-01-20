import type { Description, Name } from '../entities/general';

const docValidators = {
  name: (name: unknown): name is Name =>
    typeof name === `string` &&
    name.length === name.trim().length &&
    name.length >= 2 &&
    name.length <= 100 &&
    /^[a-zA-Z0-9]+(?:\s[a-zA-Z0-9]+)*$/.test(name.trim()),
  description: (description: unknown): description is Description => {
    if (typeof description !== `string`) {
      return false;
    }

    return (
      description.length === description.trim().length &&
      description.length >= 50 &&
      description.length <= 250
    );
  },
};

export { docValidators };
