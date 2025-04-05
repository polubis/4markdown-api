import { z } from 'zod';
import { description, markdown, name, tags } from './validators';

const documentNameSchema = name();
const permanentDocumentNameSegmentsSchema = z.array(z.string()).min(3).max(15);
const documentDescriptionSchema = description();
const documentCodeSchema = markdown(`Document content`);
const documentTagsSchema = tags();

export {
  documentCodeSchema,
  documentTagsSchema,
  documentDescriptionSchema,
  permanentDocumentNameSegmentsSchema,
  documentNameSchema,
};
