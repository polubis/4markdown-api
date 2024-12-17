import { type ControllerHandlerContext } from '@utils/controller';
import type {
  GetDocumentCommentsDto,
  GetDocumentCommentsPayload,
} from './get-document-comments.contract';

const getDocumentCommentsHandler = async ({
  payload,
  context: { db },
}: {
  payload: GetDocumentCommentsPayload;
  context: ControllerHandlerContext;
}): Promise<GetDocumentCommentsDto> => {};

export { getDocumentCommentsHandler };
