import { DocEntityField } from '../shared/entities/doc.entity';

const CreateDocPayload = DocEntityField.transform(({ name, code }) => ({
  name,
  code,
}));

export { CreateDocPayload };
