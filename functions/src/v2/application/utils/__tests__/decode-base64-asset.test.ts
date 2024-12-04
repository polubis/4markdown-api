import { decodeBase64Asset } from '../decode-base64-asset';

describe(`Decoding base64 assets`, () => {
  it(`handles image assets and extracts expected values`, () => {
    const imageBase64 = `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQE..`;
    const result = decodeBase64Asset(imageBase64);

    expect(result.blob).toBe(`/9j/4AAQSkZJRgABAQE..`);
    expect(result.contentType).toBe(`image/jpeg`);
    expect(result.extension).toBe(`jpeg`);
    expect(result.size).toBeGreaterThan(0);
    expect(result.buffer).toBeInstanceOf(Buffer);
  });

  it(`handles audio assets and extracts expected values`, () => {
    const audioBase64 = `data:audio/mp3;base64,SUQzAwAAAAAA..`;
    const result = decodeBase64Asset(audioBase64);

    expect(result.blob).toBe(`SUQzAwAAAAAA..`);
    expect(result.contentType).toBe(`audio/mp3`);
    expect(result.extension).toBe(`mp3`);
    expect(result.size).toBeGreaterThan(0);
    expect(result.buffer).toBeInstanceOf(Buffer);
  });

  it(`handles video assets and extracts expected values`, () => {
    const videoBase64 = `data:video/mp4;base64,AAAAIGZ0eXBtcDQyLj..`;
    const result = decodeBase64Asset(videoBase64);

    expect(result.blob).toBe(`AAAAIGZ0eXBtcDQyLj..`);
    expect(result.contentType).toBe(`video/mp4`);
    expect(result.extension).toBe(`mp4`);
    expect(result.size).toBeGreaterThan(0);
    expect(result.buffer).toBeInstanceOf(Buffer);
  });

  it(`handles text assets and extracts expected values`, () => {
    const textBase64 = `data:text/plain;base64,SGVsbG8gd29ybGQh`;
    const result = decodeBase64Asset(textBase64);

    expect(result.blob).toBe(`SGVsbG8gd29ybGQh`);
    expect(result.contentType).toBe(`text/plain`);
    expect(result.extension).toBe(`plain`);
    expect(result.size).toBeGreaterThan(0);
    expect(result.buffer).toBeInstanceOf(Buffer);
  });

  it(`handles assets with unknown MIME types and extracts expected values`, () => {
    const unknownBase64 = `data:application/unknown;base64,abcdef123456`;
    const result = decodeBase64Asset(unknownBase64);

    expect(result.blob).toBe(`abcdef123456`);
    expect(result.contentType).toBe(`application/unknown`);
    expect(result.extension).toBe(`unknown`);
    expect(result.size).toBeGreaterThan(0);
    expect(result.buffer).toBeInstanceOf(Buffer);
  });
});
