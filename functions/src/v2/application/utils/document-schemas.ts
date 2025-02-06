import { z } from 'zod';
import { description, name, tags } from './validators';

export const documentNameSchema = name();
export const permanentDocumentNameSegmentsSchema = z
  .array(z.string())
  .min(3)
  .max(15);
export const documentDescriptionSchema = description();
export const documentCodeSchema = z.string();
export const documentTagsSchema = tags();
