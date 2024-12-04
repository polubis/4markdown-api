import { ImageModel } from '@domain/models/image';
import { base64, Id } from '@utils/validators';
import { z } from 'zod';

const uploadImagePayloadSchema = z.object({
  image: base64,
});

type UploadImagePayload = z.infer<typeof uploadImagePayloadSchema>;
type UploadImageDto = ImageModel & {
  id: Id;
};

export type { UploadImagePayload, UploadImageDto };
export { uploadImagePayloadSchema };
