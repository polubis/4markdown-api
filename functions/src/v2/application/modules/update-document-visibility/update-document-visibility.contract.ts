import {
  type DocumentModel,
  DocumentModelVisibility,
} from '@domain/models/document';
import {
  documentDescriptionSchema,
  documentNameSchema,
  documentTagsSchema,
  permanentDocumentNameSegmentsSchema,
} from '@utils/document-schemas';
import { type Id, validators } from '@utils/validators';
import { z } from 'zod';

const updateDocumentVisibilityPayloadSchema = z.union([
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
    name: documentNameSchema.refine(({ segments }) =>
      permanentDocumentNameSegmentsSchema.parse(segments),
    ),
    tags: documentTagsSchema,
    description: documentDescriptionSchema,
  }),
]);

type UpdateDocumentVisibilityPayload = z.infer<
  typeof updateDocumentVisibilityPayloadSchema
>;
type UpdateDocumentVisibilityDto = DocumentModel & { id: Id };

export { updateDocumentVisibilityPayloadSchema };
export type { UpdateDocumentVisibilityDto, UpdateDocumentVisibilityPayload };
