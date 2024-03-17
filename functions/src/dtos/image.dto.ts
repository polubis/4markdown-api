import { Id, Path } from '../entities/general';
import { ImageContentType, ImageExtension } from '../entities/image.entity';

interface UploadImageDto {
  extension: ImageExtension;
  contentType: ImageContentType;
  path: Path;
  id: Id;
}

export type { UploadImageDto };
