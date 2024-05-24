import { z } from 'zod';
import {
  PrivateDocEntityField,
  PublicDocEntityField,
  PermamentDocEntityField,
} from '../shared/entities/doc.entity';
import { Id } from '../shared/entities/atoms';

const UpdateDocPayload = z.union([
  PrivateDocEntityField.pick({
    name: true,
    code: true,
    visibility: true,
    mdate: true,
  }).extend({
    id: Id,
  }),
  PublicDocEntityField.pick({
    name: true,
    code: true,
    visibility: true,
    mdate: true,
  }).extend({
    id: Id,
  }),
  PermamentDocEntityField.pick({
    name: true,
    code: true,
    visibility: true,
    description: true,
    mdate: true,
  }).extend({
    id: Id,
  }),
]);

export { UpdateDocPayload };
