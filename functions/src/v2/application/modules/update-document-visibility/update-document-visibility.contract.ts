import {
  type DocumentModel,
  DocumentModelVisibility,
} from '@domain/models/document';
import { documentTagsSchema } from '@utils/document-schemas';
import { type Id, validators } from '@utils/validators';
import { z } from 'zod';

const updateDocumentVisibilitySchema = z.union([
  z.object({
    id: validators.id,
    mdate: validators.date,
    visibility: z.literal(DocumentModelVisibility.Private),
  }),
  z.object({
    id: validators.id,
    mdate: validators.date,
    visibility: z.literal(DocumentModelVisibility.Public),
  }),
  z.object({
    id: validators.id,
    mdate: validators.date,
    visibility: z.literal(DocumentModelVisibility.Permanent),
    tags: documentTagsSchema,
  }),
]);

type UpdateDocumentVisibilityPayload = z.infer<
  typeof updateDocumentVisibilitySchema
>;
type UpdateDocumentVisibilityDto = DocumentModel & { id: Id };

export { updateDocumentVisibilitySchema };
export type { UpdateDocumentVisibilityDto, UpdateDocumentVisibilityPayload };
