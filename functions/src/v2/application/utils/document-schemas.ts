import { z } from 'zod';
import { description, name, tags } from './validators';

const documentNameSchema = name();
const permanentDocumentNameSegmentsSchema = z.array(z.string()).min(3).max(15);
const documentDescriptionSchema = description();
const documentCodeSchema = z.string().max(35000, `Document characters exceed. The limit is 35000`);
const documentTagsSchema = tags();

export {
  documentCodeSchema,
  documentTagsSchema,
  documentDescriptionSchema,
  permanentDocumentNameSegmentsSchema,
  documentNameSchema,
};
