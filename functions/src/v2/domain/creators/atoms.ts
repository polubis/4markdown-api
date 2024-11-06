import type { UserId } from '@domain/models/atoms';

const asUserId = (id: string): UserId => id as UserId;

export { asUserId };
