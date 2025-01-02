import { type PrivateDocumentModel } from '@domain/models/document';
import {
  documentCodeSchema,
  documentNameSchema,
} from '@utils/document-schemas';
import { type Id } from '@utils/validators';
import { z } from 'zod';

const createDocumentPayloadSchema = z.object({
  name: documentNameSchema,
  code: documentCodeSchema,
});

type CreateDocumentPayload = z.infer<typeof createDocumentPayloadSchema>;
type CreateDocumentDto = PrivateDocumentModel & { id: Id; authorId: Id };

export { createDocumentPayloadSchema };
export type { CreateDocumentDto, CreateDocumentPayload };
