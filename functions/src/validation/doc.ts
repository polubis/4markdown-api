import type { Description, Name, Tags } from '../entities/general';

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
  tags: (tags: unknown): tags is Tags => {
    if (!Array.isArray(tags)) return false;

    return (
      tags.length >= 1 &&
      tags.length <= 10 &&
      tags.length === new Set([...tags]).size &&
      tags.every(
        (tag) =>
          tag.length >= 2 && tag.length <= 50 && /^[a-zA-Z0-9,-]+$/.test(tag),
      )
    );
  },
};

export { docValidators };
