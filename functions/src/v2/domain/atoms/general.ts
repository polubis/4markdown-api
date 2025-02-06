import { type Brand } from '@utils/utility-types';

export const enum Visibility {
  Private = `private`,
  Public = `public`,
  Permanent = `permanent`,
}

export type DocumentId = Brand<string, `documentId`>;
export type MindmapNodeId = Brand<string, `mindmapNodeId`>;
export type MindmapEdgeId = Brand<string, `mindmapEdgeId`>;
