import { uploadImagePayloadSchema } from '../upload-image.contract';

describe(`Upload image contract works when`, () => {
  it(`accepts a valid base64 image data`, () => {
    const validBase64Image = `data:image/jpeg;base64,dGVzdGluZyBjb250ZW50`;

    expect(() =>
      uploadImagePayloadSchema.parse({
        image: validBase64Image,
      }),
    ).not.toThrowError();
  });

  it(`rejects partial base64 string without data URI prefix`, () => {
    const validBase64Image = `/9j/4AAQSkZJRgABAQEAAAAAA...`;

    const payload = {
      image: validBase64Image,
    };

    expect(() => uploadImagePayloadSchema.parse(payload)).toThrowError();
  });

  it(`rejects invalid base64 string`, () => {
    const invalidBase64Image = `invalid-base64-string`;

    const payload = {
      image: invalidBase64Image,
    };

    expect(() => uploadImagePayloadSchema.parse(payload)).toThrowError();
  });

  it(`rejects payload without the image field`, () => {
    const payload = {};

    expect(() => uploadImagePayloadSchema.parse(payload)).toThrowError();
  });

  it(`rejects an empty image field`, () => {
    const payload = {
      image: ``,
    };

    expect(() => uploadImagePayloadSchema.parse(payload)).toThrowError(
      `String must contain at least 1 character(s)`,
    );
  });

  it(`rejects base64 data with invalid characters`, () => {
    const invalidBase64ImageWithChars = `data:image/jpeg;base64,abc!def==`;

    const payload = {
      image: invalidBase64ImageWithChars,
    };

    expect(() => uploadImagePayloadSchema.parse(payload)).toThrowError();
  });
});
