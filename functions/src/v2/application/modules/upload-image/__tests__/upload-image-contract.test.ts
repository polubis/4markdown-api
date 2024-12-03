import { uploadImagePayloadSchema } from '../upload-image.contract'; // Adjust this import based on your project structure

describe(`Image upload schema works when`, () => {
  describe(`handling valid image formats`, () => {
    it(`accepts a valid image payload with base64 encoded data`, () => {
      const imageBase64 = `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAQABAAD/4QBgRXhpY2cA`;
      const validPayload = imageBase64;
      const result = uploadImagePayloadSchema.parse(validPayload);
      expect(result).toEqual(validPayload);
    });

    it(`accepts a valid png image payload`, () => {
      const imageBase64 = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIA...`;
      const validPayload = imageBase64;
      const result = uploadImagePayloadSchema.parse(validPayload);
      expect(result).toEqual(validPayload);
    });

    it(`accepts a valid webp image payload`, () => {
      const imageBase64 = `data:image/webp;base64,UklGRjYAAABXRU5ErkJggg==`;
      const validPayload = imageBase64;
      const result = uploadImagePayloadSchema.parse(validPayload);
      expect(result).toEqual(validPayload);
    });

    it(`accepts a valid gif image payload`, () => {
      const imageBase64 = `data:image/gif;base64,R0lGODlhAQABAIAAAAAAAEAAQAAAP8AMDAwDQ0eAOdZg==`;
      const validPayload = imageBase64;
      const result = uploadImagePayloadSchema.parse(validPayload);
      expect(result).toEqual(validPayload);
    });
  });

  describe(`handling invalid base64 data`, () => {
    it(`rejects base64 data with invalid format`, () => {
      const invalidBase64 = `data:image/unknown;base64,invalidbase64string`;
      expect(() => uploadImagePayloadSchema.parse(invalidBase64)).toThrowError(
        message,
      );
    });

    it(`rejects base64 data with missing image type`, () => {
      const invalidBase64 = `data:application/unknown;base64,abcdef123456`;
      expect(() => uploadImagePayloadSchema.parse(invalidBase64)).toThrowError(
        message,
      );
    });

    it(`rejects base64 data with unsupported image format (e.g., bmp)`, () => {
      const invalidBase64 = `data:image/bmp;base64,invalidbmpdata`;
      expect(() => uploadImagePayloadSchema.parse(invalidBase64)).toThrowError(
        message,
      );
    });
  });

  describe(`handling missing or malformed base64 data`, () => {
    it(`rejects missing base64 data`, () => {
      const missingBase64 = ``;
      expect(() => uploadImagePayloadSchema.parse(missingBase64)).toThrowError(
        message,
      );
    });

    it(`rejects invalid base64 string (not properly base64 encoded)`, () => {
      const malformedBase64 = `data:image/jpeg;base64,!!!INVALIDBASE64!!!`;
      expect(() =>
        uploadImagePayloadSchema.parse(malformedBase64),
      ).toThrowError(message);
    });
  });

  describe(`handling valid base64 with wrong content type`, () => {
    it(`rejects base64 data with incorrect mime type`, () => {
      const invalidBase64 = `data:image/png;base64,dGVzdA==`; // Example of valid base64 but wrong content type
      expect(() => uploadImagePayloadSchema.parse(invalidBase64)).toThrowError(
        message,
      );
    });
  });
});
