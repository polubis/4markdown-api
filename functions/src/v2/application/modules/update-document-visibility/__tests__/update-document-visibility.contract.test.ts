import { updateDocumentVisibilityPayloadSchema } from '../update-document-visibility.contract';
import { DocumentModelVisibility } from '@domain/models/document';

describe(`Document visibility contract works when`, () => {
  describe(`handling private visibility`, () => {
    it(`accepts a valid payload with private visibility`, () => {
      const payload = {
        id: `valid-id`,
        mdate: new Date().toISOString(),
        visibility: DocumentModelVisibility.Private,
      };
      expect(updateDocumentVisibilityPayloadSchema.parse(payload)).toEqual(
        payload,
      );
    });

    it(`rejects a payload missing fields for private visibility`, () => {
      const payload = {
        id: `valid-id`,
        visibility: DocumentModelVisibility.Private,
      };
      expect(() =>
        updateDocumentVisibilityPayloadSchema.parse(payload),
      ).toThrowError();
    });
  });

  describe(`handling public visibility`, () => {
    it(`accepts a valid payload with public visibility`, () => {
      const payload = {
        id: `valid-id`,
        mdate: new Date().toISOString(),
        visibility: DocumentModelVisibility.Public,
      };
      expect(updateDocumentVisibilityPayloadSchema.parse(payload)).toEqual(
        payload,
      );
    });

    it(`rejects a payload missing fields for public visibility`, () => {
      const payload = {
        mdate: new Date().toISOString(),
        visibility: DocumentModelVisibility.Public,
      };
      expect(() =>
        updateDocumentVisibilityPayloadSchema.parse(payload),
      ).toThrowError();
    });
  });

  describe(`handling permanent visibility`, () => {
    it(`accepts a valid payload with permanent visibility, tags, and description`, () => {
      const payload = {
        id: `valid-id`,
        mdate: new Date().toISOString(),
        visibility: DocumentModelVisibility.Permanent,
        tags: [`tag1`, `tag2`],
        description: `A valid description for the document that contains`,
      };
      expect(updateDocumentVisibilityPayloadSchema.parse(payload)).toEqual(
        payload,
      );
    });

    it(`rejects a payload with permanent visibility missing tags`, () => {
      const payload = {
        id: `valid-id`,
        mdate: new Date().toISOString(),
        visibility: DocumentModelVisibility.Permanent,
        description: `A valid description for the document`,
      };
      expect(() =>
        updateDocumentVisibilityPayloadSchema.parse(payload),
      ).toThrowError();
    });

    it(`rejects a payload with permanent visibility missing description`, () => {
      const payload = {
        id: `valid-id`,
        mdate: new Date().toISOString(),
        visibility: DocumentModelVisibility.Permanent,
        tags: [`tag1`, `tag2`],
      };
      expect(() =>
        updateDocumentVisibilityPayloadSchema.parse(payload),
      ).toThrowError();
    });

    it(`rejects a payload with permanent visibility containing invalid tags`, () => {
      const payload = {
        id: `valid-id`,
        mdate: new Date().toISOString(),
        visibility: DocumentModelVisibility.Permanent,
        tags: [`invalid-tag@`],
        description: `A valid description for the document`,
      };
      expect(() =>
        updateDocumentVisibilityPayloadSchema.parse(payload),
      ).toThrowError();
    });
  });

  describe(`handling invalid visibility types`, () => {
    it(`rejects a payload with an unknown visibility value`, () => {
      const payload = {
        id: `valid-id`,
        mdate: new Date().toISOString(),
        visibility: `UnknownVisibility`,
      };
      expect(() =>
        updateDocumentVisibilityPayloadSchema.parse(payload),
      ).toThrowError();
    });

    it(`rejects a payload missing the visibility field`, () => {
      const payload = {
        id: `valid-id`,
        mdate: new Date().toISOString(),
      };
      expect(() =>
        updateDocumentVisibilityPayloadSchema.parse(payload),
      ).toThrowError();
    });
  });
});
