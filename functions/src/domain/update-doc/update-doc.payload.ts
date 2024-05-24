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
  })
    .extend({
      id: Id,
    })
    .strict(),
  PublicDocEntityField.pick({
    name: true,
    code: true,
    visibility: true,
    mdate: true,
  })
    .extend({
      id: Id,
    })
    .strict(),
  PermamentDocEntityField.pick({
    name: true,
    code: true,
    visibility: true,
    description: true,
    mdate: true,
    tags: true,
  })
    .extend({
      id: Id,
    })
    .strict(),
]);

export { UpdateDocPayload };
