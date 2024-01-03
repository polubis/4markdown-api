import { DocsService } from './docs.service';

describe(`Docs updating works when: `, () => {
  it(`throws an error when invalid name`, async () => {
    try {
      await DocsService.update(`3123-dsad-323`, {
        name: `invalid-name`,
        code: `dasdad`,
        visibility: `public`,
        id: `312313`,
      });
    } catch (error) {
      expect((error as Error).message).toBe(`Wrong name format`);
    }
  });
});
