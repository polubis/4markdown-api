import { PrivateDocEntityField } from '../shared/entities/doc.entity';

const CreateDocPayload = PrivateDocEntityField.pick({ name: true, code: true });

export { CreateDocPayload };
