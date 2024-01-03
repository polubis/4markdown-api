import { DocsRepository } from '../repositories/docs.repository';
import { DocsService } from './docs.service';

jest.mock(`../repositories/docs.repository`);

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
      expect((error as Error).message).toMatchSnapshot();
    }
  });

  it(`throws an error if docs collection is not created yet`, async () => {
    (DocsRepository as jest.Mock).mockImplementation(() => ({
      getMy: () => Promise.resolve({ exists: false }),
    }));

    try {
      await DocsService.update(`3123-dsad-323`, {
        name: `Some article valid name`,
        code: `dasdad`,
        visibility: `public`,
        id: `312313`,
      });
    } catch (error) {
      expect((error as Error).message).toMatchSnapshot();
    }
  });
});
