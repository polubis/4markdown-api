const decodeBase64Asset = (
  asset: string,
): { blob: string; contentType: string; extension: string } => {
  const [meta, data] = asset.split(`,`);

  const contentType = meta.split(`:`)[1].split(`;`)[0];

  const extension = contentType.split(`/`)[1] || ``;

  const blob = data.replace(/^data:[^;]+;base64,/, ``);

  return {
    blob,
    contentType,
    extension,
  };
};

export { decodeBase64Asset };
