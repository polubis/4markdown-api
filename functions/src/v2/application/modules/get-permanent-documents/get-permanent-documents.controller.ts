import { protectedController } from '../../utils/controller';

type Dto = {};

const getPermanentDocumentsController = protectedController(
  async (_, { uid, db }) => {},
);

export { getPermanentDocumentsController };
