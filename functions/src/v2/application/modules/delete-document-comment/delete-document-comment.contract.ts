import { date, id } from '@utils/validators';
import { z } from 'zod';

const deleteDocumentCommentPayloadSchema = z.object({
  comment: z.object({
    id,
    mdate: date,
  }),
});

type DeleteDocumentCommentPayload = z.infer<
  typeof deleteDocumentCommentPayloadSchema
>;
type DeleteDocumentCommentDto = void;

export { deleteDocumentCommentPayloadSchema };
export type { DeleteDocumentCommentPayload, DeleteDocumentCommentDto };
