import { controller } from '@utils/controller';
import { parse } from '@utils/parse';
import {
  type GetDocumentCommentsDto,
  getDocumentCommentsPayloadSchema,
} from './get-document-comments.contract';
import { getDocumentCommentsHandler } from './get-document-comments.handler';

const getDocumentCommentsController = controller<GetDocumentCommentsDto>(
  async (rawPayload, context) => {
    return await getDocumentCommentsHandler({
      context,
      payload: await parse(getDocumentCommentsPayloadSchema, rawPayload),
    });
  },
);

export { getDocumentCommentsController };
