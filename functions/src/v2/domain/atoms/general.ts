import { Brand } from '@utils/utility-types';

const enum Visibility {
  Private = `private`,
  Public = `public`,
  Permanent = `permanent`,
}

type DocumentId = Brand<string, `documentId`>;
type MindmapNodeId = Brand<string, `mindmapNodeId`>;
type MindmapEdgeId = Brand<string, `mindmapEdgeId`>;
type ClientGeneratedId = Brand<string, `clientGeneratedId`>;

export type { DocumentId, MindmapNodeId, MindmapEdgeId, ClientGeneratedId };
export { Visibility };
