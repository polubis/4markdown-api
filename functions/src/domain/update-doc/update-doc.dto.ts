import { z } from 'zod';
import {
  PrivateDocEntityField,
  PublicDocEntityField,
  PermamentDocEntityField,
} from '../shared/entities/doc.entity';
import { Id } from '../shared/entities/atoms';

const UpdatePrivateDocDto = PrivateDocEntityField.pick({
  name: true,
  cdate: true,
  mdate: true,
  code: true,
  visibility: true,
})
  .extend({
    id: Id,
  })
  .strict();

const UpdatePublicDocDto = PublicDocEntityField.pick({
  name: true,
  cdate: true,
  mdate: true,
  code: true,
  visibility: true,
})
  .extend({
    id: Id,
  })
  .strict();

const UpdatePermamentDocDto = PermamentDocEntityField.pick({
  name: true,
  description: true,
  visibility: true,
  cdate: true,
  mdate: true,
  code: true,
  tags: true,
  path: true,
})
  .extend({
    id: Id,
  })
  .strict();

const UpdateDocDto = z.union([
  UpdatePrivateDocDto,
  UpdatePublicDocDto,
  UpdatePermamentDocDto,
]);

export {
  UpdateDocDto,
  UpdatePrivateDocDto,
  UpdatePublicDocDto,
  UpdatePermamentDocDto,
};
