import { type Brand } from '@utils/utility-types';

export const enum Visibility {
  Private = `private`,
  Public = `public`,
  Permanent = `permanent`,
}

export type Tags = Brand<string[], 'tags'>;

export type MindmapId = Brand<string, `mindmapId`>;
export type DocumentId = Brand<string, `documentId`>;
export type MindmapNodeId = Brand<string, `mindmapNodeId`>;
export type MindmapEdgeId = Brand<string, `mindmapEdgeId`>;
