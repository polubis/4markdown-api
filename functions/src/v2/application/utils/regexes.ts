const regexes = {
  date: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
  username: /^[a-zA-Z0-9_-]+$/,
  base64: /^data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=]+$/,
  noEdgeSpaces: /^\S(.*\S)?$/,
  document: {
    name: /^[a-zA-Z0-9]+(?:\s[a-zA-Z0-9]+)*$/,
  },
};

export { regexes };
