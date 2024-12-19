import { type DocumentCommentModel } from '@domain/models/document-comment';
import { commentContentSchema } from '@utils/comment-schemas';
import { date, type Id, id } from '@utils/validators';
import { z } from 'zod';

const editDocumentCommentPayloadSchema = z.object({
  document: z.object({
    id,
    authorId: id,
  }),
  comment: z.object({
    id,
    content: commentContentSchema,
    mdate: date,
  }),
});

type EditDocumentCommentPayload = z.infer<
  typeof editDocumentCommentPayloadSchema
>;
type EditDocumentCommentDto = DocumentCommentModel & { id: Id };

export { editDocumentCommentPayloadSchema };
export type { EditDocumentCommentPayload, EditDocumentCommentDto };
