import { z } from 'zod';
import {
  PrivateDocEntityField,
  PublicDocEntityField,
  PermamentDocEntityField,
} from '../shared/entities/doc.entity';
import { Id } from '../shared/entities/atoms';

const UpdatePrivateDocPayload = PrivateDocEntityField.pick({
  name: true,
  code: true,
  visibility: true,
  mdate: true,
})
  .extend({
    id: Id,
  })
  .strict();

const UpdatePublicDtoPayload = PublicDocEntityField.pick({
  name: true,
  code: true,
  visibility: true,
  mdate: true,
})
  .extend({
    id: Id,
  })
  .strict();

const UpdatePermanentDocPayload = PermamentDocEntityField.pick({
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
  .strict();

const UpdateDocPayload = z.union([
  UpdatePrivateDocPayload,
  UpdatePublicDtoPayload,
  UpdatePermanentDocPayload,
]);

export {
  UpdateDocPayload,
  UpdatePrivateDocPayload,
  UpdatePublicDtoPayload,
  UpdatePermanentDocPayload,
};
