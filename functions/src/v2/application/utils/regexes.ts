const regexes = {
  date: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
  username: /^[a-zA-Z0-9_-]+$/,
  base64: /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/,
  noEdgeSpaces: /^\S(.*\S)?$/,
  document: {
    name: /^[a-zA-Z0-9]+(?:\s[a-zA-Z0-9]+)*$/,
  },
};

export { regexes };
