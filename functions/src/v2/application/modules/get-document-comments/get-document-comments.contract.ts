import { type DocumentCommentModel } from '@domain/models/document-comment';
import { type Id, id } from '@utils/validators';
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
type GetDocumentCommentsDto = (DocumentCommentModel & { id: Id })[];

export { getDocumentCommentsPayloadSchema };
export type { GetDocumentCommentsPayload, GetDocumentCommentsDto };
