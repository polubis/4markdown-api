import { documentNameSchema } from '@utils/document-schemas';
import { type Date, validators } from '@utils/validators';
import { z } from 'zod';

const updateDocumentNamePayloadSchema = z.object({
  id: validators.id,
  mdate: validators.date,
  name: documentNameSchema,
});

type UpdateDocumentNamePayload = z.infer<
  typeof updateDocumentNamePayloadSchema
>;

type UpdateDocumentNameDto = {
  mdate: Date;
  name: string;
};

export type { UpdateDocumentNamePayload, UpdateDocumentNameDto };
export { updateDocumentNamePayloadSchema };
