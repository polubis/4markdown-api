import { type DocumentCommentModel } from '@domain/models/document-comment';
import { commentContentSchema } from '@utils/comment-schemas';
import { type Id, id } from '@utils/validators';
import { z } from 'zod';

const addDocumentCommentPayloadSchema = z.object({
  document: z.object({
    id,
    authorId: id,
  }),
  comment: z.object({
    content: commentContentSchema,
  }),
});

type AddDocumentCommentPayload = z.infer<
  typeof addDocumentCommentPayloadSchema
>;
type AddDocumentCommentDto = DocumentCommentModel & { id: Id };

export { addDocumentCommentPayloadSchema };
export type { AddDocumentCommentPayload, AddDocumentCommentDto };
