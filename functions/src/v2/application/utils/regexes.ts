const regexes = {
  date: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
  username: /^[a-zA-Z0-9_-]+$/,
  base64: /^\s*data:([a-zA-Z]+\/[a-zA-Z]+)?(;base64)?,[a-zA-Z0-9+/]+={0,2}\s*$/,
  noEdgeSpaces: /^\S(.*\S)?$/,
  document: {
    name: /^[a-zA-Z0-9]+(?:\s[a-zA-Z0-9]+)*$/,
  },
};

export { regexes };
