import { DocumentCommentModel } from '@domain/models/document-comment';
import { commentContentSchema } from '@utils/comment-schemas';
import { id } from '@utils/validators';
import { z } from 'zod';

const addDocumentCommentPayloadSchema = z.object({
  documentId: id,
  authorId: id,
  content: commentContentSchema,
});

type AddDocumentCommentPayload = z.infer<
  typeof addDocumentCommentPayloadSchema
>;
type AddDocumentCommentDto = DocumentCommentModel;

export { addDocumentCommentPayloadSchema };
export type { AddDocumentCommentPayload, AddDocumentCommentDto };
