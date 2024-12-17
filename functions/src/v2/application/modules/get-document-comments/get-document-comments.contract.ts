import { DocumentCommentModel } from '@domain/models/document-comment';
import { id } from '@utils/validators';
import { z } from 'zod';

const getDocumentCommentsPayloadSchema = z.object({
  document: z.object({
    id,
    authorId: id,
  }),
});

type GetDocumentCommentsPayload = z.infer<
  typeof getDocumentCommentsPayloadSchema
>;
type GetDocumentCommentsDto = DocumentCommentModel[];

export { getDocumentCommentsPayloadSchema };
export type { GetDocumentCommentsPayload, GetDocumentCommentsDto };
