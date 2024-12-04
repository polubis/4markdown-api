const decodeBase64Asset = (
  asset: string,
): {
  blob: string;
  contentType: string;
  extension: string;
  buffer: Buffer;
  size: number;
} => {
  const [meta, data] = asset.split(`,`);

  const contentType = meta.split(`:`)[1].split(`;`)[0];

  const extension = contentType.split(`/`)[1] || ``;

  const blob = data.replace(/^data:[^;]+;base64,/, ``);

  const buffer = Buffer.from(blob, `base64`);

  const size = Buffer.byteLength(buffer);

  return {
    blob,
    contentType,
    extension,
    buffer,
    size,
  };
};

export { decodeBase64Asset };
