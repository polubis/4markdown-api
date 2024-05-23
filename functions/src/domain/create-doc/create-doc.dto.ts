import { PrivateDocEntityField } from '../shared/entities/doc.entity';
import { Id } from '../shared/entities/atoms';

const CreateDocDto = PrivateDocEntityField.pick({
  name: true,
  code: true,
  cdate: true,
  mdate: true,
  visibility: true,
}).extend({
  id: Id,
});

export { CreateDocDto };
