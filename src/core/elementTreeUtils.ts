import { Element } from './types';

export function findElementInTree(
  root: Element,
  targetId: string,
  parent: Element | null = null
): { element: Element; parent: Element | null; index: number } | null {
  if (root.id === targetId) {
    return { element: root, parent, index: -1 };
  }

  if (root.children && root.children.length > 0) {
    for (let i = 0; i < root.children.length; i++) {
      const child = root.children[i];
      if (child.id === targetId) {
        return { element: child, parent: root, index: i };
      }
      const found = findElementInTree(child, targetId, root);
      if (found) return found;
    }
  }

  return null;
}

export function removeElementFromTree(root: Element, targetId: string): boolean {
  if (!root.children) return false;
  const index = root.children.findIndex((c) => c.id === targetId);
  if (index !== -1) {
    root.children.splice(index, 1);
    return true;
  }
  for (const child of root.children) {
    if (removeElementFromTree(child, targetId)) return true;
  }
  return false;
}

export function insertElementIntoTree(
  root: Element,
  arg1: Element | string,
  arg2?: Element | string,
  index?: number
): boolean {
  let element: Element;
  let targetParentId: string | undefined;

  if (typeof arg1 === 'string') {
    targetParentId = arg1;
    element = arg2 as Element;
  } else {
    element = arg1;
    targetParentId = typeof arg2 === 'string' ? arg2 : undefined;
  }

  if (!element) return false;

  const targetParent = targetParentId ? findElementInTree(root, targetParentId)?.element || root : root;
  if (!targetParent.children) targetParent.children = [];

  if (index !== undefined && index >= 0 && index <= targetParent.children.length) {
    targetParent.children.splice(index, 0, element);
  } else {
    targetParent.children.push(element);
  }
  return true;
}

export function reorderElementInTree(
  root: Element,
  elementId: string,
  targetParentId?: string,
  newIndex?: number
): boolean {
  const found = findElementInTree(root, elementId);
  if (!found || !found.element) return false;

  const elem = found.element;
  removeElementFromTree(root, elementId);

  const targetParent = targetParentId ? findElementInTree(root, targetParentId)?.element || root : root;
  if (!targetParent.children) targetParent.children = [];

  if (newIndex !== undefined && newIndex >= 0 && newIndex <= targetParent.children.length) {
    targetParent.children.splice(newIndex, 0, elem);
  } else {
    targetParent.children.push(elem);
  }

  return true;
}

export function cloneElementWithNewIds(element: Element): Element {
  const newId = `el-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const clonedChildren = (element.children || []).map((c) => cloneElementWithNewIds(c));

  return {
    ...element,
    id: newId,
    children: clonedChildren,
  };
}
