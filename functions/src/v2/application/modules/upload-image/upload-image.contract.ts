import { base64 } from '@utils/validators';
import { z } from 'zod';

const uploadImagePayloadSchema = z.object({
  image: base64,
});

type UploadImagePayload = z.infer<typeof uploadImagePayloadSchema>;

export type { UploadImagePayload };
export { uploadImagePayloadSchema };
