import {
  updateDocumentVisibilityPayloadSchema,
  type UpdateDocumentVisibilityPayload,
} from '../update-document-visibility.contract';
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
      } as UpdateDocumentVisibilityPayload;
      expect(() =>
        updateDocumentVisibilityPayloadSchema.parse(payload),
      ).toThrowError();
    });
  });

  describe(`handling permanent visibility`, () => {
    it(`accepts a valid payload with permanent visibility, tags, and description`, () => {
      const mdate = new Date().toISOString();
      const payload = {
        id: `valid-id`,
        mdate,
        visibility: DocumentModelVisibility.Permanent,
        tags: [`tag1`, `tag2`],
        name: `This is valid name`,
        description: `A valid description for the document that contains`,
      };
      const expectedPayload: UpdateDocumentVisibilityPayload = {
        ...payload,
        name: {
          raw: `This is valid name`,
          path: `this-is-valid-name`,
          segments: [`this`, `is`, `valid`, `name`],
        },
      };

      expect(updateDocumentVisibilityPayloadSchema.parse(payload)).toEqual(
        expectedPayload,
      );
    });

    it(`rejects payload with invalid amount of segments in name`, () => {
      expect(() =>
        updateDocumentVisibilityPayloadSchema.parse({
          id: `valid-id`,
          mdate: new Date().toISOString(),
          visibility: DocumentModelVisibility.Permanent,
          tags: [`tag1`, `tag2`],
          name: `This is`,
          description: `A valid description for the document that contains`,
        }),
      ).toThrowError(`Array must contain at least 3 element(s)`);
      expect(() =>
        updateDocumentVisibilityPayloadSchema.parse({
          id: `valid-id`,
          mdate: new Date().toISOString(),
          visibility: DocumentModelVisibility.Permanent,
          tags: [`tag1`, `tag2`],
          name: `This is`.repeat(15),
          description: `A valid description for the document that contains`,
        }),
      ).toThrowError(`Array must contain at most 15 element(s)`);
    });

    it(`rejects a payload with permanent visibility missing tags`, () => {
      const payload = {
        id: `valid-id`,
        mdate: new Date().toISOString(),
        visibility: DocumentModelVisibility.Permanent,
        name: `This is valid name`,
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
