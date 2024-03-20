import { HttpsError } from 'firebase-functions/v1/auth';
import { UsersService } from './users.service';

describe(`Image upload works when: `, () => {
  it(`unauthorized users are blocked`, async () => {
    try {
      await UsersService.uploadImage(
        {
          image: `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQE`,
        },
        { auth: null } as any,
      );
    } catch (err: unknown) {
      expect((err as HttpsError).message).toBe(`Unauthorized`);
    }
  });
});
