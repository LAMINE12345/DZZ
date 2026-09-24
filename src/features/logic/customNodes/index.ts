import { BaseNode } from './BaseNode';

export * from './BaseNode';

export const nodeTypes = {
  custom: BaseNode,
  event: BaseNode,
  action: BaseNode,
  logic: BaseNode,
  data: BaseNode,
  utility: BaseNode,
  api: BaseNode,
};
