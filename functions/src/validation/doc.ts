const docValidators = {
  name: (name: unknown): boolean =>
    typeof name === `string` &&
    name.length === name.trim().length &&
    name.length >= 2 &&
    name.length <= 100 &&
    /^[a-zA-Z0-9]+(?:\s[a-zA-Z0-9]+)*$/.test(name.trim()),
};

export { docValidators };
