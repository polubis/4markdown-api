import { z } from 'zod';
import {
  PrivateDocEntityField,
  PublicDocEntityField,
  PermamentDocEntityField,
} from '../shared/entities/doc.entity';
import { Id } from '../shared/entities/atoms';

const UpdateDocDto = z.union([
  PrivateDocEntityField.pick({
    name: true,
    cdate: true,
    mdate: true,
    visibility: true,
  }).extend({
    id: Id,
  }),
  PublicDocEntityField.pick({
    name: true,
    cdate: true,
    mdate: true,
    visibility: true,
  }).extend({
    id: Id,
  }),
  PermamentDocEntityField.pick({
    name: true,
    description: true,
    visibility: true,
    cdate: true,
    mdate: true,
    tags: true,
    path: true,
  }).extend({
    id: Id,
  }),
]);

export { UpdateDocDto };
